// Roaming 3D Voxel Math Mobs & The ACT Math Titan Boss
window.MathCraft = window.MathCraft || {};

window.MathCraft.Mobs = (function () {
  const World = window.MathCraft.World;
  const B = window.MathCraft.Blocks.ID;

  const TYPES = {
    slime: {
      name: 'Algebra Slime',
      maxHp: 1,
      radius: 0.55,
      height: 0.95,
      speed: 1.5,
      domain: 'algebra1',
      baseGems: 32,
      baseXp: 40,
      materialDrop: { iron: 1 },
      colorHex: '#4ade80',
      isBoss: false
    },
    golem: {
      name: 'Geometry Golem',
      maxHp: 2,
      radius: 0.65,
      height: 1.95,
      speed: 1.25,
      domain: 'plane_geo',
      baseGems: 70,
      baseXp: 85,
      materialDrop: { gold: 2, iron: 1 },
      colorHex: '#facc15',
      isBoss: false
    },
    wraith: {
      name: 'Matrix & Log Wraith',
      maxHp: 2,
      radius: 0.6,
      height: 1.85,
      speed: 1.65,
      domain: 'advanced_topic',
      baseGems: 95,
      baseXp: 110,
      materialDrop: { diamond: 1, gold: 1 },
      colorHex: '#38bdf8',
      isBoss: false
    },
    boss: {
      name: '👑 ACT Math Titan (BOSS)',
      maxHp: 5,
      radius: 0.95,
      height: 2.85,
      speed: 1.4,
      domain: 'boss_mix',
      baseGems: 260,
      baseXp: 320,
      materialDrop: { diamond: 4, gold: 4 },
      colorHex: '#c084fc',
      isBoss: true
    }
  };

  let nextId = 1;
  const list = [];

  function spawnMob(typeKey, x, z, anchorX = null, anchorZ = null, patrolRadius = 10) {
    const def = TYPES[typeKey];
    if (!def) return null;
    const sy = World.getSurfaceY(Math.floor(x), Math.floor(z));
    const mob = {
      id: nextId++,
      type: typeKey,
      def,
      x: x + 0.5,
      y: sy + 1.0,
      z: z + 0.5,
      yaw: Math.random() * Math.PI * 2,
      hp: def.maxHp,
      maxHp: def.maxHp,
      anchorX: anchorX !== null ? anchorX : x,
      anchorZ: anchorZ !== null ? anchorZ : z,
      patrolRadius,
      walkTimer: Math.random() * 4,
      dirX: 0,
      dirZ: 0,
      animPhase: Math.random() * 10,
      hurtFlash: 0,
      alive: true,
      respawnAt: 0
    };
    list.push(mob);
    return mob;
  }

  function initWorldMobs() {
    list.length = 0;
    // Starter Slimes wandering near spawn hills!
    spawnMob('slime', 28, 24, 28, 24, 8);
    spawnMob('slime', 37, 25, 37, 25, 8);
    spawnMob('slime', 32, 39, 32, 39, 9);
    // Geometry Golems patrolling mid-ring
    spawnMob('golem', 20, 22, 20, 22, 9);
    spawnMob('golem', 44, 28, 44, 28, 9);
    // Matrix & Log Wraiths on outer hills
    spawnMob('wraith', 44, 17, 44, 17, 10);
    spawnMob('wraith', 18, 40, 18, 40, 10);
    // The ACT Math Titan Boss patrolling the Boss Arena straight ahead at (32, 13)!
    spawnMob('boss', 32, 13, 32, 13, 3.6);
  }

  function respawnBossNow() {
    const existing = list.find(m => m.type === 'boss');
    if (existing) {
      const sy = World.getSurfaceY(32, 13);
      existing.x = 32.5;
      existing.z = 13.5;
      existing.y = sy + 1.0;
      existing.hp = existing.maxHp;
      existing.alive = true;
      existing.respawnAt = 0;
      existing.hurtFlash = 0;
      return existing;
    }
    return spawnMob('boss', 32, 13, 32, 13, 3.6);
  }

  function damageMob(mob, dmg = 1) {
    if (!mob || !mob.alive) return false;
    mob.hp = Math.max(0, mob.hp - dmg);
    mob.hurtFlash = 0.45;
    if (mob.hp <= 0) {
      mob.alive = false;
      // Non-boss mobs respawn after 28s; Boss respawns after 45s
      mob.respawnAt = Date.now() + (mob.def.isBoss ? 45000 : 28000);
      return true; // defeated!
    }
    return false;
  }

  function update(dt, playerX, playerZ, paused) {
    const now = Date.now();
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (!m.alive) {
        if (m.respawnAt && now >= m.respawnAt) {
          const sy = World.getSurfaceY(Math.floor(m.anchorX), Math.floor(m.anchorZ));
          m.x = m.anchorX + 0.5;
          m.z = m.anchorZ + 0.5;
          m.y = sy + 1.0;
          m.hp = m.maxHp;
          m.alive = true;
          m.respawnAt = 0;
        }
        continue;
      }

      if (m.hurtFlash > 0) m.hurtFlash = Math.max(0, m.hurtFlash - dt);
      if (paused) continue;

      m.animPhase += dt * (m.type === 'slime' ? 5.2 : 3.6);
      m.walkTimer -= dt;

      const distPlayer = Math.hypot(playerX - m.x, playerZ - m.z);
      if (m.walkTimer <= 0) {
        m.walkTimer = 1.6 + Math.random() * 2.4;
        // Gently face & stroll near player if within range, otherwise wander around anchor
        const distAnchor = Math.hypot(m.x - m.anchorX, m.z - m.anchorZ);
        if (distAnchor > m.patrolRadius) {
          const ang = Math.atan2(m.anchorZ - m.z, m.anchorX - m.x);
          m.dirX = Math.cos(ang);
          m.dirZ = Math.sin(ang);
        } else if (distPlayer < 10 && distPlayer > 2.4) {
          const ang = Math.atan2(playerZ - m.z, playerX - m.x);
          m.dirX = Math.cos(ang) * 0.7;
          m.dirZ = Math.sin(ang) * 0.7;
        } else if (Math.random() < 0.7) {
          const ang = Math.random() * Math.PI * 2;
          m.dirX = Math.cos(ang);
          m.dirZ = Math.sin(ang);
        } else {
          m.dirX = 0;
          m.dirZ = 0;
        }
      }

      const spd = m.def.speed;
      const nx = m.x + m.dirX * spd * dt;
      const nz = m.z + m.dirZ * spd * dt;

      if (Math.hypot(m.dirX, m.dirZ) > 0.05) {
        m.yaw = Math.atan2(m.dirX, m.dirZ);
      }

      if (nx > 3 && nx < World.SIZE_X - 3 && nz > 3 && nz < World.SIZE_Z - 3) {
        const sy = World.getSurfaceY(Math.floor(nx), Math.floor(nz));
        const topBlock = World.getBlock(Math.floor(nx), sy, Math.floor(nz));
        if (topBlock !== B.WATER && Math.abs((sy + 1) - m.y) <= 1.35) {
          m.x = nx;
          m.z = nz;
          m.y += ((sy + 1.0) - m.y) * Math.min(1, dt * 10);
        } else {
          m.dirX = -m.dirX;
          m.dirZ = -m.dirZ;
        }
      }
    }
  }

  // Ray-vs-AABB intersection for clicking/targeting mobs in 3D!
  function raycastMob(ox, oy, oz, dx, dy, dz, maxDist = 7.5) {
    let best = null;
    let bestT = maxDist;
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (!m.alive) continue;
      const r = m.def.radius * 1.15;
      const minX = m.x - r, maxX = m.x + r;
      const minY = m.y, maxY = m.y + m.def.height + 0.15;
      const minZ = m.z - r, maxZ = m.z + r;

      let tmin = 0.15, tmax = bestT;
      const axes = [
        [ox, dx, minX, maxX],
        [oy, dy, minY, maxY],
        [oz, dz, minZ, maxZ]
      ];
      let hit = true;
      for (let a = 0; a < 3; a++) {
        const [o, d, lo, hi] = axes[a];
        if (Math.abs(d) < 1e-6) {
          if (o < lo || o > hi) { hit = false; break; }
        } else {
          let t1 = (lo - o) / d;
          let t2 = (hi - o) / d;
          if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
          tmin = Math.max(tmin, t1);
          tmax = Math.min(tmax, t2);
          if (tmin > tmax) { hit = false; break; }
        }
      }
      if (hit && tmin < bestT) {
        bestT = tmin;
        best = { mob: m, dist: tmin };
      }
    }
    return best;
  }

  // Helper to push a rotated colored 3D box (x,y,z, r,g,b, shade) into vertex buffer
  function pushBox(out, cx, cy, cz, yaw, lx, ly, lz, w, h, d, rgb, hurt) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const hw = w / 2, hd = d / 2;
    const corners = [
      [-hw, 0, -hd], [hw, 0, -hd], [hw, h, -hd], [-hw, h, -hd],
      [-hw, 0, hd],  [hw, 0, hd],  [hw, h, hd],  [-hw, h, hd]
    ].map(([vx, vy, vz]) => {
      const rx = lx + vx;
      const rz = lz + vz;
      return [
        cx + rx * c + rz * s,
        cy + ly + vy,
        cz - rx * s + rz * c
      ];
    });

    const r = hurt ? 1.0 : rgb[0];
    const g = hurt ? 0.35 : rgb[1];
    const b = hurt ? 0.35 : rgb[2];

    const quads = [
      [3, 2, 6, 7, 1.0],  // top
      [0, 4, 5, 1, 0.55], // bottom
      [4, 7, 6, 5, 0.90], // front (+z)
      [1, 2, 3, 0, 0.80], // back (-z)
      [5, 6, 2, 1, 0.74], // right
      [0, 3, 7, 4, 0.70]  // left
    ];
    for (let q = 0; q < quads.length; q++) {
      const [i0, i1, i2, i3, sh] = quads[q];
      const tris = [corners[i0], corners[i1], corners[i2], corners[i0], corners[i2], corners[i3]];
      for (let t = 0; t < 6; t++) {
        out.push(tris[t][0], tris[t][1], tris[t][2], r * sh, g * sh, b * sh);
      }
    }
  }

  // Build vertex array for all living mobs each frame (lightweight: ~10 mobs!)
  function buildVertices() {
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (!m.alive) continue;
      const hurt = m.hurtFlash > 0;
      const bob = Math.abs(Math.sin(m.animPhase)) * (m.type === 'slime' ? 0.35 : 0.08);
      const swing = Math.sin(m.animPhase) * 0.14;

      if (m.type === 'slime') {
        // Bouncy Minecraft Slime!
        pushBox(out, m.x, m.y + bob, m.z, m.yaw, 0, 0, 0, 0.88, 0.84, 0.88, [0.24, 0.82, 0.36], hurt);
        // Eyes on +Z face
        pushBox(out, m.x, m.y + bob, m.z, m.yaw, -0.2, 0.45, 0.42, 0.16, 0.16, 0.08, [0.06, 0.12, 0.08], hurt);
        pushBox(out, m.x, m.y + bob, m.z, m.yaw, 0.2, 0.45, 0.42, 0.16, 0.16, 0.08, [0.06, 0.12, 0.08], hurt);
        pushBox(out, m.x, m.y + bob, m.z, m.yaw, 0, 0.22, 0.42, 0.14, 0.12, 0.08, [0.06, 0.12, 0.08], hurt);
      } else if (m.type === 'golem') {
        // Armored Geometry Golem
        pushBox(out, m.x, m.y, m.z, m.yaw, -0.22, 0, swing, 0.28, 0.65, 0.28, [0.48, 0.53, 0.60], hurt);
        pushBox(out, m.x, m.y, m.z, m.yaw, 0.22, 0, -swing, 0.28, 0.65, 0.28, [0.48, 0.53, 0.60], hurt);
        pushBox(out, m.x, m.y, m.z, m.yaw, 0, 0.65, 0, 0.86, 0.78, 0.48, [0.62, 0.68, 0.76], hurt);
        pushBox(out, m.x, m.y, m.z, m.yaw, 0, 0.88, 0.24, 0.32, 0.32, 0.08, [0.96, 0.78, 0.15], hurt); // gold rune
        pushBox(out, m.x, m.y, m.z, m.yaw, -0.58, 0.62, -swing, 0.24, 0.78, 0.26, [0.55, 0.60, 0.68], hurt);
        pushBox(out, m.x, m.y, m.z, m.yaw, 0.58, 0.62, swing, 0.24, 0.78, 0.26, [0.55, 0.60, 0.68], hurt);
        pushBox(out, m.x, m.y, m.z, m.yaw, 0, 1.43, 0, 0.52, 0.48, 0.48, [0.68, 0.74, 0.82], hurt);
        pushBox(out, m.x, m.y, m.z, m.yaw, -0.13, 1.62, 0.24, 0.11, 0.1, 0.06, [0.22, 0.85, 0.98], hurt);
        pushBox(out, m.x, m.y, m.z, m.yaw, 0.13, 1.62, 0.24, 0.11, 0.1, 0.06, [0.22, 0.85, 0.98], hurt);
      } else if (m.type === 'wraith') {
        // Floating Matrix & Log Wraith
        const hover = 0.38 + Math.sin(m.animPhase) * 0.2;
        pushBox(out, m.x, m.y + hover, m.z, m.yaw, 0, 0, 0, 0.58, 0.88, 0.42, [0.16, 0.22, 0.48], hurt);
        pushBox(out, m.x, m.y + hover, m.z, m.yaw, 0, 0.92, 0, 0.52, 0.52, 0.52, [0.12, 0.68, 0.94], hurt);
        pushBox(out, m.x, m.y + hover, m.z, m.yaw, -0.14, 1.12, 0.26, 0.11, 0.1, 0.06, [0.99, 0.92, 0.45], hurt);
        pushBox(out, m.x, m.y + hover, m.z, m.yaw, 0.14, 1.12, 0.26, 0.11, 0.1, 0.06, [0.99, 0.92, 0.45], hurt);
        // Floating shoulder crystals
        pushBox(out, m.x, m.y + hover + Math.cos(m.animPhase) * 0.12, m.z, m.yaw, -0.55, 0.55, 0, 0.22, 0.42, 0.22, [0.68, 0.36, 0.96], hurt);
        pushBox(out, m.x, m.y + hover - Math.cos(m.animPhase) * 0.12, m.z, m.yaw, 0.55, 0.55, 0, 0.22, 0.42, 0.22, [0.68, 0.36, 0.96], hurt);
      } else if (m.type === 'boss') {
        // ACT MATH TITAN (Towering Crowned Boss!)
        const stomp = Math.abs(Math.sin(m.animPhase * 0.7)) * 0.1;
        // Legs
        pushBox(out, m.x, m.y, m.z, m.yaw, -0.34, 0, swing, 0.42, 0.95, 0.42, [0.18, 0.10, 0.32], hurt);
        pushBox(out, m.x, m.y, m.z, m.yaw, 0.34, 0, -swing, 0.42, 0.95, 0.42, [0.18, 0.10, 0.32], hurt);
        // Massive Torso + Glowing Gold Chest Core
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, 0, 0.95, 0, 1.32, 1.05, 0.72, [0.28, 0.12, 0.48], hurt);
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, 0, 1.25, 0.36, 0.52, 0.48, 0.1, [0.98, 0.80, 0.18], hurt);
        // Broad Armored Arms
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, -0.88, 0.9, -swing * 1.4, 0.38, 1.08, 0.40, [0.38, 0.16, 0.62], hurt);
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, 0.88, 0.9, swing * 1.4, 0.38, 1.08, 0.40, [0.38, 0.16, 0.62], hurt);
        // Head + Glowing Crimson Eyes
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, 0, 2.0, 0, 0.76, 0.68, 0.68, [0.22, 0.08, 0.36], hurt);
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, -0.18, 2.26, 0.35, 0.18, 0.14, 0.08, [0.98, 0.25, 0.35], hurt);
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, 0.18, 2.26, 0.35, 0.18, 0.14, 0.08, [0.98, 0.25, 0.35], hurt);
        // Golden Crown!
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, 0, 2.68, 0, 0.82, 0.18, 0.74, [0.98, 0.82, 0.16], hurt);
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, -0.28, 2.86, 0, 0.16, 0.20, 0.16, [0.98, 0.88, 0.30], hurt);
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, 0, 2.86, 0, 0.18, 0.26, 0.18, [0.30, 0.85, 0.98], hurt);
        pushBox(out, m.x, m.y + stomp, m.z, m.yaw, 0.28, 2.86, 0, 0.16, 0.20, 0.16, [0.98, 0.88, 0.30], hurt);
      }
    }
    return new Float32Array(out);
  }

  return {
    TYPES,
    list,
    initWorldMobs,
    respawnBossNow,
    damageMob,
    update,
    raycastMob,
    buildVertices
  };
})();
