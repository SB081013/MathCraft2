// Custom Zero-Dependency WebGL 3D Voxel Engine + First-Person Controller + Particles
window.MathCraft = window.MathCraft || {};

window.MathCraft.Engine3D = (function () {
  const World = window.MathCraft.World;
  const Blocks = window.MathCraft.Blocks;
  const B = Blocks.ID;
  const INFO = Blocks.INFO;

  let canvas = null;
  let gl = null;
  let program = null;
  let lineProgram = null;
  let mobProgram = null;
  let atlasTex = null;

  // Uniform & attribute locations
  let uProj, uView, uTime, uAtlas, uFogColor;
  let aPos, aUv, aShade, aGlow;
  let uLineProj, uLineView, uLineColor, aLinePos;
  let uMobProj, uMobView, uMobFog, aMobPos, aMobCol;
  let boxLineBuf = null;
  let partBuf = null;
  let mobBuf = null;

  const chunkMeshes = new Map(); // "cx,cz" -> { vbo, count }

  // Player physics & camera state
  const player = {
    x: 32.5,
    y: 13.0,
    z: 32.5,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: 0,       // 0 looks toward -Z (directly at starter math ores!)
    pitch: -0.14,
    onGround: false,
    speedMult: 1.0,
    jumpMult: 1.0,
    walkBob: 0
  };

  const keys = {};
  const touchInput = { moveX: 0, moveY: 0, sprint: false, jump: false };
  let lookTouchId = null;
  let lookTouchX = 0;
  let lookTouchY = 0;
  let lookTouchMoved = false;
  let pointerLocked = false;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let paused = true;

  // Raycast hit result
  let currentTarget = null;

  // 3D particles on block break
  const particles = [];

  // Hand swing animation state
  let handSwing = 0;
  let handCanvas = null;
  let handCtx = null;

  // Callbacks into game.js
  let callbacks = {
    onMine: () => {},
    onHitMob: () => {},
    onPlace: () => {},
    onTargetChange: () => {},
    onEscape: () => {},
    onFrameHud: () => {}
  };

  // ==================== MATRIX MATH ====================
  function mat4Perspective(fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  function mat4Look(px, py, pz, yaw, pitch) {
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cy = Math.cos(yaw), sy = Math.sin(yaw);

    // Forward vector (yaw=0 -> (0,0,-1))
    const fx = -sy * cp;
    const fy = sp;
    const fz = -cy * cp;

    // Right vector
    const rx = cy;
    const ry = 0;
    const rz = -sy;

    // Up = Right x Forward
    const ux = ry * fz - rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy - ry * fx;

    return new Float32Array([
      rx, ux, -fx, 0,
      ry, uy, -fy, 0,
      rz, uz, -fz, 0,
      -(rx * px + ry * py + rz * pz),
      -(ux * px + uy * py + uz * pz),
      (fx * px + fy * py + fz * pz),
      1
    ]);
  }

  function getLookDir() {
    const cp = Math.cos(player.pitch), sp = Math.sin(player.pitch);
    const cy = Math.cos(player.yaw), sy = Math.sin(player.yaw);
    return { x: -sy * cp, y: sp, z: -cy * cp };
  }

  // ==================== SHADERS ====================
  const VS_SRC = `
    attribute vec3 aPos;
    attribute vec2 aUv;
    attribute float aShade;
    attribute float aGlow;
    uniform mat4 uProj;
    uniform mat4 uView;
    varying vec2 vUv;
    varying float vShade;
    varying float vGlow;
    varying float vDist;
    void main() {
      vec4 viewPos = uView * vec4(aPos, 1.0);
      gl_Position = uProj * viewPos;
      vUv = aUv;
      vShade = aShade;
      vGlow = aGlow;
      vDist = length(viewPos.xyz);
    }
  `;

  const FS_SRC = `
    precision mediump float;
    uniform sampler2D uAtlas;
    uniform float uTime;
    uniform vec3 uFogColor;
    varying vec2 vUv;
    varying float vShade;
    varying float vGlow;
    varying float vDist;
    void main() {
      vec4 tex = texture2D(uAtlas, vUv);
      vec3 col = tex.rgb * vShade;
      if (vGlow > 0.5) {
        float pulse = 0.14 + 0.14 * sin(uTime * 3.6);
        col = col * (1.0 + pulse) + vec3(0.04, 0.08, 0.06) * pulse * 2.0;
      }
      float fog = clamp((vDist - 24.0) / 38.0, 0.0, 1.0);
      col = mix(col, uFogColor, fog);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const LINE_VS = `
    attribute vec3 aPos;
    uniform mat4 uProj;
    uniform mat4 uView;
    void main() {
      gl_Position = uProj * uView * vec4(aPos, 1.0);
    }
  `;
  const LINE_FS = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
      gl_FragColor = uColor;
    }
  `;

  const MOB_VS = `
    attribute vec3 aPos;
    attribute vec3 aCol;
    uniform mat4 uProj;
    uniform mat4 uView;
    varying vec3 vCol;
    varying float vDist;
    void main() {
      vec4 vp = uView * vec4(aPos, 1.0);
      gl_Position = uProj * vp;
      vCol = aCol;
      vDist = length(vp.xyz);
    }
  `;
  const MOB_FS = `
    precision mediump float;
    uniform vec3 uFogColor;
    varying vec3 vCol;
    varying float vDist;
    void main() {
      float fog = clamp((vDist - 24.0) / 38.0, 0.0, 1.0);
      gl_FragColor = vec4(mix(vCol, uFogColor, fog), 1.0);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(s));
    }
    return s;
  }

  function createProgram(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compileShader(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, compileShader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    return p;
  }

  // ==================== CHUNK MESH BUILDER ====================
  // 6 face definitions: normal, 4 corners (CCW), shade multiplier, tile role
  const FACES = [
    { // +Y Top
      dir: [0, 1, 0], shade: 1.0, role: 'top',
      v: [[0,1,1, 0,1], [1,1,1, 1,1], [1,1,0, 1,0], [0,1,0, 0,0]]
    },
    { // -Y Bottom
      dir: [0, -1, 0], shade: 0.55, role: 'bottom',
      v: [[0,0,0, 0,0], [1,0,0, 1,0], [1,0,1, 1,1], [0,0,1, 0,1]]
    },
    { // +Z Front
      dir: [0, 0, 1], shade: 0.86, role: 'side',
      v: [[0,0,1, 0,1], [1,0,1, 1,1], [1,1,1, 1,0], [0,1,1, 0,0]]
    },
    { // -Z Back
      dir: [0, 0, -1], shade: 0.82, role: 'side',
      v: [[1,0,0, 0,1], [0,0,0, 1,1], [0,1,0, 1,0], [1,1,0, 0,0]]
    },
    { // +X Right
      dir: [1, 0, 0], shade: 0.74, role: 'side',
      v: [[1,0,1, 0,1], [1,0,0, 1,1], [1,1,0, 1,0], [1,1,1, 0,0]]
    },
    { // -X Left
      dir: [-1, 0, 0], shade: 0.70, role: 'side',
      v: [[0,0,0, 0,1], [0,0,1, 1,1], [0,1,1, 1,0], [0,1,0, 0,0]]
    }
  ];

  function rebuildChunk(cx, cz) {
    const startX = cx * World.CHUNK_SIZE;
    const startZ = cz * World.CHUNK_SIZE;
    const verts = [];
    const cols = 16;
    const step = 1 / cols;
    const eps = 0.0015; // prevent texture bleeding

    for (let x = startX; x < startX + World.CHUNK_SIZE; x++) {
      for (let z = startZ; z < startZ + World.CHUNK_SIZE; z++) {
        for (let y = 0; y < World.SIZE_Y; y++) {
          const id = World.getBlock(x, y, z);
          if (id === B.AIR) continue;
          const info = INFO[id];
          if (!info) continue;
          const glow = (info.isMath || id === B.GLOWSTONE) ? 1.0 : 0.0;

          for (let f = 0; f < 6; f++) {
            const face = FACES[f];
            const nx = x + face.dir[0];
            const ny = y + face.dir[1];
            const nz = z + face.dir[2];
            const nb = World.getBlock(nx, ny, nz);

            // Render face if neighbor is air, or if current is solid and neighbor is water
            if (nb !== B.AIR && !(info.solid && nb === B.WATER)) continue;

            const tileIdx = info[face.role];
            const u0 = (tileIdx % cols) * step + eps;
            const v0 = Math.floor(tileIdx / cols) * step + eps;
            const u1 = u0 + step - eps * 2;
            const v1 = v0 + step - eps * 2;

            // Simple vertex ambient occlusion darkening if block above-side casts shadow
            const c = face.v;
            const tris = [c[0], c[1], c[2], c[0], c[2], c[3]];
            for (let t = 0; t < 6; t++) {
              const p = tris[t];
              const uu = p[3] === 0 ? u0 : u1;
              const vv = p[4] === 0 ? v0 : v1;
              const yOffset = (id === B.WATER && p[1] === 1) ? -0.12 : 0;
              verts.push(
                x + p[0], y + p[1] + yOffset, z + p[2],
                uu, vv,
                face.shade,
                glow
              );
            }
          }
        }
      }
    }

    const key = `${cx},${cz}`;
    let entry = chunkMeshes.get(key);
    if (!entry) {
      entry = { vbo: gl.createBuffer(), count: 0 };
      chunkMeshes.set(key, entry);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, entry.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    entry.count = verts.length / 7;
  }

  // ==================== VOXEL & MOB RAYCAST ====================
  function raycast(maxDist = 6.2) {
    const dir = getLookDir();
    const ox = player.x;
    const oy = player.y + 1.58; // eye height
    const oz = player.z;

    // Check roaming mobs first (up to 7.8 blocks reach!)
    const Mobs = window.MathCraft.Mobs;
    const mobHit = Mobs ? Mobs.raycastMob(ox, oy, oz, dir.x, dir.y, dir.z, 7.8) : null;

    let lastAir = null;
    let blockHit = null;
    const step = 0.05;
    for (let d = 0.15; d <= maxDist; d += step) {
      const rx = Math.floor(ox + dir.x * d);
      const ry = Math.floor(oy + dir.y * d);
      const rz = Math.floor(oz + dir.z * d);
      const id = World.getBlock(rx, ry, rz);
      if (id !== B.AIR && id !== B.WATER) {
        blockHit = {
          x: rx, y: ry, z: rz, id, dist: d,
          placePos: lastAir
        };
        break;
      }
      lastAir = { x: rx, y: ry, z: rz };
    }

    if (mobHit && (!blockHit || mobHit.dist < blockHit.dist + 0.25)) {
      return { isMob: true, mob: mobHit.mob, dist: mobHit.dist };
    }
    return blockHit;
  }

  // ==================== COLLISION & MOVEMENT ====================
  function collidesAt(nx, ny, nz) {
    const r = 0.28;
    const h = 1.72;
    const checks = [
      [nx - r, ny + 0.002, nz - r], [nx + r, ny + 0.002, nz - r],
      [nx - r, ny + 0.002, nz + r], [nx + r, ny + 0.002, nz + r],
      [nx - r, ny + 0.9, nz - r],   [nx + r, ny + 0.9, nz - r],
      [nx - r, ny + 0.9, nz + r],   [nx + r, ny + 0.9, nz + r],
      [nx - r, ny + h, nz - r],     [nx + r, ny + h, nz - r],
      [nx - r, ny + h, nz + r],     [nx + r, ny + h, nz + r]
    ];
    for (let i = 0; i < checks.length; i++) {
      if (World.isSolid(checks[i][0], checks[i][1], checks[i][2])) return true;
    }
    return false;
  }

  function updatePhysics(dt) {
    if (paused) return;

    // Arrow keys also rotate camera nicely for trackpad / accessibility
    const rotSpeed = 2.0 * dt;
    if (keys['ArrowLeft']) player.yaw += rotSpeed;
    if (keys['ArrowRight']) player.yaw -= rotSpeed;
    if (keys['ArrowUp']) player.pitch = Math.min(1.45, player.pitch + rotSpeed * 0.75);
    if (keys['ArrowDown']) player.pitch = Math.max(-1.45, player.pitch - rotSpeed * 0.75);

    const cy = Math.cos(player.yaw), sy = Math.sin(player.yaw);
    let moveX = 0, moveZ = 0;
    if (keys['KeyW'] || keys['w']) { moveX -= sy; moveZ -= cy; }
    if (keys['KeyS'] || keys['s']) { moveX += sy; moveZ += cy; }
    if (keys['KeyA'] || keys['a']) { moveX -= cy; moveZ += sy; }
    if (keys['KeyD'] || keys['d']) { moveX += cy; moveZ -= sy; }

    // Combine iPhone / Touch Virtual Joystick input!
    if (Math.abs(touchInput.moveX) > 0.08 || Math.abs(touchInput.moveY) > 0.08) {
      // touchInput.moveY < 0 is forward (joystick pushed up), moveX > 0 is strafe right
      const fwd = -touchInput.moveY;
      const right = touchInput.moveX;
      moveX += (-sy * fwd + cy * right);
      moveZ += (-cy * fwd - sy * right);
    }

    const len = Math.hypot(moveX, moveZ);
    const sprint = (keys['ShiftLeft'] || keys['ShiftRight'] || keys['shift'] || touchInput.sprint) ? 1.48 : 1.0;
    const speed = 5.6 * sprint * player.speedMult;

    if (len > 0.001) {
      moveX = (moveX / len) * speed;
      moveZ = (moveZ / len) * speed;
      player.walkBob += dt * (sprint > 1 ? 13 : 9);
    }

    // Horizontal move with smooth X/Z axis slide + gentle auto-jump up 1-block steps
    let blockedHoriz = false;
    const nx = player.x + moveX * dt;
    if (!collidesAt(nx, player.y, player.z)) {
      player.x = nx;
    } else if (Math.abs(moveX) > 0.01) {
      blockedHoriz = true;
    }
    const nz = player.z + moveZ * dt;
    if (!collidesAt(player.x, player.y, nz)) {
      player.z = nz;
    } else if (Math.abs(moveZ) > 0.01) {
      blockedHoriz = true;
    }

    // Minecraft-style auto-hop when walking into a 1-block step with clear headroom
    if (blockedHoriz && player.onGround && len > 0.001) {
      const stepX = player.x + (moveX / speed) * 0.45;
      const stepZ = player.z + (moveZ / speed) * 0.45;
      if (!collidesAt(stepX, player.y + 1.02, stepZ)) {
        player.vy = 7.6 * player.jumpMult;
        player.onGround = false;
      }
    }

    // Clamp inside world bounds
    player.x = Math.max(1.5, Math.min(World.SIZE_X - 1.5, player.x));
    player.z = Math.max(1.5, Math.min(World.SIZE_Z - 1.5, player.z));

    // Jump & Gravity
    const inWater = World.getBlock(Math.floor(player.x), Math.floor(player.y + 0.4), Math.floor(player.z)) === B.WATER;
    if (keys['Space'] || keys[' '] || touchInput.jump) {
      if (player.onGround) {
        player.vy = 8.4 * player.jumpMult;
        player.onGround = false;
        window.MathCraft.Audio.playJump();
      } else if (inWater) {
        player.vy = 4.2;
      }
    }

    player.vy -= (inWater ? 11.0 : 23.0) * dt;
    if (inWater && player.vy < -3.5) player.vy = -3.5;

    const ny = player.y + player.vy * dt;
    if (!collidesAt(player.x, ny, player.z)) {
      player.y = ny;
      player.onGround = false;
    } else {
      if (player.vy < 0) {
        // Snap cleanly to the TOP surface of the solid block beneath feet!
        player.y = Math.floor(ny + 0.002) + 1.0;
        player.onGround = true;
      }
      player.vy = 0;
    }

    // Safety unstuck: if player ever ends up overlapping a solid block at feet, lift cleanly
    if (collidesAt(player.x, player.y, player.z)) {
      player.y = Math.floor(player.y) + 1.0;
    }

    // Safety floor respawn if ever fell
    if (player.y < 1) {
      const sy = World.getSurfaceY(32, 32);
      player.x = 32.5; player.z = 32.5; player.y = sy + 2; player.vy = 0;
    }

    // Update target block or mob
    const hit = raycast();
    const prevKey = currentTarget ? (currentTarget.isMob ? `mob:${currentTarget.mob.id}:${currentTarget.mob.hp}` : `${currentTarget.x},${currentTarget.y},${currentTarget.z}`) : '';
    const nextKey = hit ? (hit.isMob ? `mob:${hit.mob.id}:${hit.mob.hp}` : `${hit.x},${hit.y},${hit.z}`) : '';
    currentTarget = hit;
    if (prevKey !== nextKey) {
      callbacks.onTargetChange(hit);
    }
  }

  // ==================== PARTICLES & HAND VIEWMODEL ====================
  function spawnBreakParticles(bx, by, bz, colorHex) {
    const r = parseInt(colorHex.slice(1, 3), 16) / 255;
    const g = parseInt(colorHex.slice(3, 5), 16) / 255;
    const b = parseInt(colorHex.slice(5, 7), 16) / 255;
    for (let i = 0; i < 16; i++) {
      particles.push({
        x: bx + 0.2 + Math.random() * 0.6,
        y: by + 0.2 + Math.random() * 0.6,
        z: bz + 0.2 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 4.5,
        vy: 1.5 + Math.random() * 3.8,
        vz: (Math.random() - 0.5) * 4.5,
        life: 0.45 + Math.random() * 0.35,
        color: [r, g, b]
      });
    }
  }

  let pickaxeColor = '#b45309'; // changes with tier!
  function setPickaxeVisual(color) {
    pickaxeColor = color;
  }

  function triggerHandSwing() {
    handSwing = 1.0;
  }

  function drawHand(dt) {
    if (!handCtx) return;
    handCtx.clearRect(0, 0, 260, 260);
    if (paused) return;

    if (handSwing > 0) handSwing = Math.max(0, handSwing - dt * 5.2);
    const swingAngle = Math.sin(handSwing * Math.PI) * -0.75;
    const bobX = Math.cos(player.walkBob) * 6;
    const bobY = Math.abs(Math.sin(player.walkBob)) * 7;

    handCtx.save();
    handCtx.translate(165 + bobX, 195 + bobY);
    handCtx.rotate(-0.35 + swingAngle);

    // Pixelated Pickaxe Handle
    handCtx.fillStyle = '#78350f';
    handCtx.fillRect(-10, -105, 18, 125);
    handCtx.fillStyle = '#92400e';
    handCtx.fillRect(-6, -105, 6, 125);

    // Pixelated Pickaxe Head (colored by current tier!)
    handCtx.fillStyle = '#0f172a';
    handCtx.fillRect(-64, -124, 126, 30);
    handCtx.fillStyle = pickaxeColor;
    handCtx.fillRect(-60, -120, 118, 22);
    handCtx.fillRect(-74, -106, 22, 20);
    handCtx.fillRect(50, -106, 22, 20);
    // Shine highlight
    handCtx.fillStyle = 'rgba(255,255,255,0.45)';
    handCtx.fillRect(-52, -118, 96, 6);

    handCtx.restore();
  }

  // ==================== RENDERING ====================
  function drawWireBox(proj, view, bx, by, bz) {
    const e = 0.008;
    const x0 = bx - e, y0 = by - e, z0 = bz - e;
    const x1 = bx + 1 + e, y1 = by + 1 + e, z1 = bz + 1 + e;
    const lines = new Float32Array([
      x0,y0,z0, x1,y0,z0,  x1,y0,z0, x1,y0,z1,  x1,y0,z1, x0,y0,z1,  x0,y0,z1, x0,y0,z0,
      x0,y1,z0, x1,y1,z0,  x1,y1,z0, x1,y1,z1,  x1,y1,z1, x0,y1,z1,  x0,y1,z1, x0,y1,z0,
      x0,y0,z0, x0,y1,z0,  x1,y0,z0, x1,y1,z0,  x1,y0,z1, x1,y1,z1,  x0,y0,z1, x0,y1,z1
    ]);
    gl.useProgram(lineProgram);
    gl.uniformMatrix4fv(uLineProj, false, proj);
    gl.uniformMatrix4fv(uLineView, false, view);
    gl.uniform4f(uLineColor, 1.0, 0.95, 0.45, 0.95);
    gl.bindBuffer(gl.ARRAY_BUFFER, boxLineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aLinePos);
    gl.vertexAttribPointer(aLinePos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, 24);
  }

  function drawParticles(proj, view, dt) {
    if (particles.length === 0) return;
    gl.useProgram(lineProgram);
    gl.uniformMatrix4fv(uLineProj, false, proj);
    gl.uniformMatrix4fv(uLineView, false, view);
    gl.bindBuffer(gl.ARRAY_BUFFER, partBuf);
    gl.enableVertexAttribArray(aLinePos);
    gl.vertexAttribPointer(aLinePos, 3, gl.FLOAT, false, 0, 0);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.vy -= 14 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      const s = 0.08;
      const tri = new Float32Array([
        p.x - s, p.y - s, p.z, p.x + s, p.y - s, p.z, p.x, p.y + s, p.z,
        p.x, p.y - s, p.z - s, p.x, p.y - s, p.z + s, p.x, p.y + s, p.z
      ]);
      gl.uniform4f(uLineColor, p.color[0], p.color[1], p.color[2], 1.0);
      gl.bufferData(gl.ARRAY_BUFFER, tri, gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  let lastTime = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
    lastTime = now;

    // Rebuild any modified chunks
    const dirty = World.consumeDirtyChunks();
    for (let i = 0; i < dirty.length; i++) {
      rebuildChunk(dirty[i][0], dirty[i][1]);
    }

    updatePhysics(dt);
    if (window.MathCraft.Mobs) {
      window.MathCraft.Mobs.update(dt, player.x, player.z, paused);
    }

    // Resize canvas cleanly if needed
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Crisp sky blue background
    const sky = [0.46, 0.74, 0.96];
    gl.clearColor(sky[0], sky[1], sky[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const proj = mat4Perspective(Math.PI / 2.65, canvas.width / Math.max(1, canvas.height), 0.1, 110);
    const bobOffset = paused ? 0 : Math.sin(player.walkBob * 2) * 0.04;
    const view = mat4Look(player.x, player.y + 1.58 + bobOffset, player.z, player.yaw, player.pitch);

    gl.useProgram(program);
    gl.uniformMatrix4fv(uProj, false, proj);
    gl.uniformMatrix4fv(uView, false, view);
    gl.uniform1f(uTime, now / 1000);
    gl.uniform3fv(uFogColor, sky);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.uniform1i(uAtlas, 0);

    const stride = 7 * 4;
    chunkMeshes.forEach(mesh => {
      if (mesh.count === 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, stride, 3 * 4);
      gl.enableVertexAttribArray(aShade);
      gl.vertexAttribPointer(aShade, 1, gl.FLOAT, false, stride, 5 * 4);
      gl.enableVertexAttribArray(aGlow);
      gl.vertexAttribPointer(aGlow, 1, gl.FLOAT, false, stride, 6 * 4);
      gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
    });

    // Render roaming 3D Math Mobs & Boss
    if (window.MathCraft.Mobs && mobProgram) {
      const mobVerts = window.MathCraft.Mobs.buildVertices();
      if (mobVerts.length > 0) {
        gl.disable(gl.CULL_FACE);
        gl.useProgram(mobProgram);
        gl.uniformMatrix4fv(uMobProj, false, proj);
        gl.uniformMatrix4fv(uMobView, false, view);
        gl.uniform3fv(uMobFog, sky);
        gl.bindBuffer(gl.ARRAY_BUFFER, mobBuf);
        gl.bufferData(gl.ARRAY_BUFFER, mobVerts, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(aMobPos);
        gl.vertexAttribPointer(aMobPos, 3, gl.FLOAT, false, 6 * 4, 0);
        gl.enableVertexAttribArray(aMobCol);
        gl.vertexAttribPointer(aMobCol, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
        gl.drawArrays(gl.TRIANGLES, 0, mobVerts.length / 6);
        gl.enable(gl.CULL_FACE);
      }
    }

    if (currentTarget && !currentTarget.isMob && !paused) {
      drawWireBox(proj, view, currentTarget.x, currentTarget.y, currentTarget.z);
    }
    drawParticles(proj, view, dt);
    drawHand(dt);
    if (!paused) callbacks.onFrameHud(proj, view, canvas.clientWidth, canvas.clientHeight);
  }

  // ==================== INPUT & INITIALIZATION ====================
  function init(canvasEl, handEl, cbs) {
    canvas = canvasEl;
    handCanvas = handEl;
    handCtx = handEl.getContext('2d');
    callbacks = { ...callbacks, ...cbs };

    gl = canvas.getContext('webgl', { antialias: false });
    if (!gl) {
      alert('WebGL is required to play MathCraft 3D.');
      return false;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    program = createProgram(VS_SRC, FS_SRC);
    uProj = gl.getUniformLocation(program, 'uProj');
    uView = gl.getUniformLocation(program, 'uView');
    uTime = gl.getUniformLocation(program, 'uTime');
    uAtlas = gl.getUniformLocation(program, 'uAtlas');
    uFogColor = gl.getUniformLocation(program, 'uFogColor');
    aPos = gl.getAttribLocation(program, 'aPos');
    aUv = gl.getAttribLocation(program, 'aUv');
    aShade = gl.getAttribLocation(program, 'aShade');
    aGlow = gl.getAttribLocation(program, 'aGlow');

    lineProgram = createProgram(LINE_VS, LINE_FS);
    uLineProj = gl.getUniformLocation(lineProgram, 'uProj');
    uLineView = gl.getUniformLocation(lineProgram, 'uView');
    uLineColor = gl.getUniformLocation(lineProgram, 'uColor');
    aLinePos = gl.getAttribLocation(lineProgram, 'aPos');
    boxLineBuf = gl.createBuffer();
    partBuf = gl.createBuffer();

    mobProgram = createProgram(MOB_VS, MOB_FS);
    uMobProj = gl.getUniformLocation(mobProgram, 'uProj');
    uMobView = gl.getUniformLocation(mobProgram, 'uView');
    uMobFog = gl.getUniformLocation(mobProgram, 'uFogColor');
    aMobPos = gl.getAttribLocation(mobProgram, 'aPos');
    aMobCol = gl.getAttribLocation(mobProgram, 'aCol');
    mobBuf = gl.createBuffer();

    // Upload procedural pixel atlas
    const atlas = Blocks.getAtlas();
    atlasTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Place player on surface at spawn
    const sy = World.getSurfaceY(32, 32);
    player.x = 32.5;
    player.z = 32.5;
    player.y = sy + 1.05;

    // Input listeners (track both e.code and lowercase e.key for universal keyboard support)
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (e.key) keys[e.key.toLowerCase()] = true;
      if ((e.code === 'Space' || e.code.startsWith('Arrow')) && !paused) e.preventDefault();
      if (e.code === 'KeyF' && !paused && currentTarget && !currentTarget.isMob && currentTarget.placePos) {
        callbacks.onPlace(currentTarget.placePos);
      }
      if (e.code === 'Escape') {
        callbacks.onEscape();
      }
    });
    window.addEventListener('keyup', e => {
      keys[e.code] = false;
      if (e.key) keys[e.key.toLowerCase()] = false;
    });
    window.addEventListener('blur', () => {
      Object.keys(keys).forEach(k => keys[k] = false);
    });

    document.addEventListener('pointerlockchange', () => {
      pointerLocked = (document.pointerLockElement === canvas);
    });

    canvas.addEventListener('contextmenu', e => e.preventDefault());

    let dragMoved = false;
    canvas.addEventListener('mousedown', e => {
      if (paused) return;
      if (!pointerLocked) {
        // Attempt pointer lock for classic Minecraft controls, and also support drag
        if (canvas.requestPointerLock) {
          try {
            const p = canvas.requestPointerLock();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } catch (_) {}
        }
        isDragging = true;
        dragMoved = false;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      } else {
        if (e.button === 0 && currentTarget) {
          triggerHandSwing();
          if (currentTarget.isMob) callbacks.onHitMob(currentTarget.mob);
          else callbacks.onMine(currentTarget);
        } else if (e.button === 2 && currentTarget && !currentTarget.isMob && currentTarget.placePos) {
          triggerHandSwing();
          callbacks.onPlace(currentTarget.placePos);
        }
      }
    });

    window.addEventListener('mouseup', e => {
      if (isDragging && !pointerLocked && !paused && !dragMoved) {
        if (e.button === 0 && currentTarget) {
          triggerHandSwing();
          if (currentTarget.isMob) callbacks.onHitMob(currentTarget.mob);
          else callbacks.onMine(currentTarget);
        } else if (e.button === 2 && currentTarget && !currentTarget.isMob && currentTarget.placePos) {
          triggerHandSwing();
          callbacks.onPlace(currentTarget.placePos);
        }
      }
      isDragging = false;
    });

    window.addEventListener('mousemove', e => {
      if (paused) return;
      const sens = 0.0024;
      if (pointerLocked) {
        player.yaw -= e.movementX * sens;
        player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - e.movementY * sens));
      } else if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        if (Math.hypot(dx, dy) > 4) dragMoved = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        player.yaw -= dx * 0.004;
        player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - dy * 0.004));
      }
    });

    // Multi-touch Look & Tap-to-Mine on Canvas (for iPhone / iPad!)
    canvas.addEventListener('touchstart', e => {
      if (paused) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (lookTouchId === null) {
          lookTouchId = t.identifier;
          lookTouchX = t.clientX;
          lookTouchY = t.clientY;
          lookTouchMoved = false;
        }
      }
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      if (paused) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === lookTouchId) {
          const dx = t.clientX - lookTouchX;
          const dy = t.clientY - lookTouchY;
          if (Math.hypot(dx, dy) > 4) lookTouchMoved = true;
          lookTouchX = t.clientX;
          lookTouchY = t.clientY;
          player.yaw -= dx * 0.0055;
          player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - dy * 0.005));
        }
      }
      e.preventDefault();
    }, { passive: false });

    const endLookTouch = e => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === lookTouchId) {
          if (!paused && !lookTouchMoved && currentTarget) {
            triggerHandSwing();
            if (currentTarget.isMob) callbacks.onHitMob(currentTarget.mob);
            else callbacks.onMine(currentTarget);
          }
          lookTouchId = null;
        }
      }
    };
    canvas.addEventListener('touchend', endLookTouch, { passive: true });
    canvas.addEventListener('touchcancel', endLookTouch, { passive: true });

    requestAnimationFrame(frame);
    return true;
  }

  function setTouchMove(mx, my, sprint) {
    touchInput.moveX = mx;
    touchInput.moveY = my;
    touchInput.sprint = !!sprint;
  }

  function setTouchJump(active) {
    touchInput.jump = !!active;
  }

  function triggerPrimaryAction() {
    if (paused || !currentTarget) return;
    triggerHandSwing();
    if (currentTarget.isMob) callbacks.onHitMob(currentTarget.mob);
    else callbacks.onMine(currentTarget);
  }

  function triggerSecondaryAction() {
    if (paused || !currentTarget || currentTarget.isMob || !currentTarget.placePos) return;
    triggerHandSwing();
    callbacks.onPlace(currentTarget.placePos);
  }

  function setPaused(val) {
    paused = val;
    if (paused) {
      Object.keys(keys).forEach(k => keys[k] = false);
      touchInput.moveX = 0; touchInput.moveY = 0; touchInput.sprint = false; touchInput.jump = false;
      lookTouchId = null;
      if (document.pointerLockElement === canvas && document.exitPointerLock) {
        try { document.exitPointerLock(); } catch (_) {}
      }
    }
  }

  function requestLock() {
    if (!paused && canvas && canvas.requestPointerLock) {
      try {
        const p = canvas.requestPointerLock();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
    }
  }

  function isPlayerOverlappingBlock(bx, by, bz) {
    return (
      Math.abs(player.x - (bx + 0.5)) < 0.78 &&
      Math.abs(player.z - (bz + 0.5)) < 0.78 &&
      player.y < by + 1 && player.y + 1.75 > by
    );
  }

  function projectToScreen(wx, wy, wz, proj, view, screenW, screenH) {
    // Multiply view * [wx, wy, wz, 1]
    const vx = view[0] * wx + view[4] * wy + view[8] * wz + view[12];
    const vy = view[1] * wx + view[5] * wy + view[9] * wz + view[13];
    const vz = view[2] * wx + view[6] * wy + view[10] * wz + view[14];
    const vw = view[3] * wx + view[7] * wy + view[11] * wz + view[15];
    if (vz >= -0.2) return null; // behind camera
    const cx = proj[0] * vx + proj[4] * vy + proj[8] * vz + proj[12] * vw;
    const cy = proj[1] * vx + proj[5] * vy + proj[9] * vz + proj[13] * vw;
    const cw = proj[3] * vx + proj[7] * vy + proj[11] * vz + proj[15] * vw;
    if (cw <= 0.001) return null;
    const nx = cx / cw;
    const ny = cy / cw;
    if (nx < -1.1 || nx > 1.1 || ny < -1.1 || ny > 1.1) return null;
    return {
      x: (nx * 0.5 + 0.5) * screenW,
      y: (1 - (ny * 0.5 + 0.5)) * screenH,
      dist: -vz
    };
  }

  return {
    init,
    setPaused,
    requestLock,
    player,
    spawnBreakParticles,
    setPickaxeVisual,
    triggerHandSwing,
    isPlayerOverlappingBlock,
    projectToScreen,
    setTouchMove,
    setTouchJump,
    triggerPrimaryAction,
    triggerSecondaryAction
  };
})();
