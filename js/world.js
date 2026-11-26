// Procedural 3D Voxel World Generator + Chunked Storage
window.MathCraft = window.MathCraft || {};

window.MathCraft.World = (function () {
  const SIZE_X = 64;
  const SIZE_Y = 32;
  const SIZE_Z = 64;
  const CHUNK_SIZE = 16;
  const CHUNKS_X = SIZE_X / CHUNK_SIZE;
  const CHUNKS_Z = SIZE_Z / CHUNK_SIZE;

  const B = window.MathCraft.Blocks.ID;
  const INFO = window.MathCraft.Blocks.INFO;

  const data = new Uint8Array(SIZE_X * SIZE_Y * SIZE_Z);
  let edits = {}; // "x,y,z" -> blockId
  const dirtyChunks = new Set();

  function idx(x, y, z) {
    return (y * SIZE_Z + z) * SIZE_X + x;
  }

  function inBounds(x, y, z) {
    return x >= 0 && x < SIZE_X && y >= 0 && y < SIZE_Y && z >= 0 && z < SIZE_Z;
  }

  function getBlock(x, y, z) {
    if (!inBounds(x, y, z)) return B.AIR;
    return data[idx(x, y, z)];
  }

  function markChunkDirty(x, z) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    if (cx >= 0 && cx < CHUNKS_X && cz >= 0 && cz < CHUNKS_Z) {
      dirtyChunks.add(`${cx},${cz}`);
    }
    // Neighbor chunks if on edge
    const lx = x % CHUNK_SIZE;
    const lz = z % CHUNK_SIZE;
    if (lx === 0 && cx > 0) dirtyChunks.add(`${cx - 1},${cz}`);
    if (lx === CHUNK_SIZE - 1 && cx < CHUNKS_X - 1) dirtyChunks.add(`${cx + 1},${cz}`);
    if (lz === 0 && cz > 0) dirtyChunks.add(`${cx},${cz - 1}`);
    if (lz === CHUNK_SIZE - 1 && cz < CHUNKS_Z - 1) dirtyChunks.add(`${cx},${cz + 1}`);
  }

  function setBlock(x, y, z, id, recordEdit = true) {
    if (!inBounds(x, y, z)) return;
    data[idx(x, y, z)] = id;
    if (recordEdit) {
      edits[`${x},${y},${z}`] = id;
    }
    markChunkDirty(x, z);
  }

  // Deterministic 2D value noise for smooth hills
  function hash2(x, z) {
    let n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  function smoothNoise(x, z) {
    const ix = Math.floor(x), iz = Math.floor(z);
    const fx = x - ix, fz = z - iz;
    const ux = fx * fx * (3 - 2 * fx);
    const uz = fz * fz * (3 - 2 * fz);
    const a = hash2(ix, iz);
    const b = hash2(ix + 1, iz);
    const c = hash2(ix, iz + 1);
    const d = hash2(ix + 1, iz + 1);
    return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
  }

  function fbm(x, z) {
    let v = 0, amp = 0.55, freq = 0.055;
    for (let i = 0; i < 3; i++) {
      v += smoothNoise(x * freq, z * freq) * amp;
      freq *= 2.05;
      amp *= 0.45;
    }
    return v;
  }

  function getSurfaceY(x, z) {
    for (let y = SIZE_Y - 1; y >= 1; y--) {
      const id = getBlock(x, y, z);
      if (id !== B.AIR && id !== B.LEAVES && id !== B.WOOD) return y;
    }
    return 8;
  }

  function buildTree(tx, baseY, tz) {
    const trunkH = 4 + (Math.floor(hash2(tx, tz) * 2));
    for (let y = 1; y <= trunkH; y++) {
      if (baseY + y < SIZE_Y - 2) setBlock(tx, baseY + y, tz, B.WOOD, false);
    }
    const top = baseY + trunkH;
    for (let dy = -1; dy <= 2; dy++) {
      const r = dy >= 1 ? 1 : 2;
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) === r && Math.abs(dz) === r && dy !== 0) continue;
          const bx = tx + dx, by = top + dy, bz = tz + dz;
          if (inBounds(bx, by, bz) && getBlock(bx, by, bz) === B.AIR) {
            setBlock(bx, by, bz, B.LEAVES, false);
          }
        }
      }
    }
  }

  function placeRuinShrine(cx, cz) {
    const sy = getSurfaceY(cx, cz);
    // Stone platform
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let y = sy - 2; y <= sy; y++) {
          setBlock(cx + dx, y, cz + dz, B.COBBLE, false);
        }
        for (let y = sy + 1; y <= sy + 6; y++) {
          setBlock(cx + dx, y, cz + dz, B.AIR, false);
        }
      }
    }
    // Corner pillars with glowstone tops
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([dx, dz]) => {
      setBlock(cx + dx, sy + 1, cz + dz, B.STONE, false);
      setBlock(cx + dx, sy + 2, cz + dz, B.STONE, false);
      setBlock(cx + dx, sy + 3, cz + dz, B.GLOWSTONE, false);
    });
    // Central Shrine pedestal & ACT Shrine block
    setBlock(cx, sy + 1, cz, B.BRICK, false);
    setBlock(cx, sy + 2, cz, B.SHRINE, false);
  }

  function placeChestPedestal(cx, cz) {
    const sy = getSurfaceY(cx, cz);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        setBlock(cx + dx, sy, cz + dz, B.COBBLE, false);
        for (let y = sy + 1; y <= sy + 3; y++) {
          setBlock(cx + dx, y, cz + dz, B.AIR, false);
        }
      }
    }
    setBlock(cx, sy + 1, cz, B.CHEST, false);
  }

  function placeExamTemple(cx, cz) {
    const sy = getSurfaceY(cx, cz);
    for (let dx = -3; dx <= 3; dx++) {
      for (let dz = -3; dz <= 3; dz++) {
        for (let y = sy - 2; y <= sy; y++) setBlock(cx + dx, y, cz + dz, B.BRICK, false);
        for (let y = sy + 1; y <= sy + 7; y++) setBlock(cx + dx, y, cz + dz, B.AIR, false);
      }
    }
    // 4 Temple Columns + Roof Beams + Glowstone Crown
    [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([dx, dz]) => {
      for (let h = 1; h <= 4; h++) setBlock(cx + dx, sy + h, cz + dz, B.COBBLE, false);
      setBlock(cx + dx, sy + 5, cz + dz, B.GLOWSTONE, false);
    });
    // Central Exam Altar
    setBlock(cx, sy + 1, cz, B.GLOWSTONE, false);
    setBlock(cx, sy + 2, cz, B.EXAM_PORTAL, false);
  }

  function placeBossArena(cx, cz) {
    const sy = getSurfaceY(cx, cz);
    for (let dx = -4; dx <= 4; dx++) {
      for (let dz = -4; dz <= 4; dz++) {
        if (Math.hypot(dx, dz) <= 4.3) {
          for (let y = sy - 2; y <= sy; y++) setBlock(cx + dx, y, cz + dz, B.COBBLE, false);
          for (let y = sy + 1; y <= sy + 6; y++) setBlock(cx + dx, y, cz + dz, B.AIR, false);
        }
      }
    }
    [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([dx, dz]) => {
      setBlock(cx + dx, sy + 1, cz + dz, B.ORE_NETHERITE, false);
      setBlock(cx + dx, sy + 2, cz + dz, B.GLOWSTONE, false);
    });
  }

  function placeOreCluster(cx, cz, oreId) {
    const sy = getSurfaceY(cx, cz);
    setBlock(cx, sy + 1, cz, oreId, false);
    if (hash2(cx + 3, cz) > 0.35) setBlock(cx + 1, sy + 1, cz, oreId, false);
    if (hash2(cx, cz + 7) > 0.45) setBlock(cx, sy + 2, cz, oreId, false);
  }

  function generate(savedEdits) {
    data.fill(B.AIR);
    edits = savedEdits ? { ...savedEdits } : {};
    dirtyChunks.clear();

    const waterLevel = 7;

    // 1. Base terrain + underground math ores
    for (let x = 0; x < SIZE_X; x++) {
      for (let z = 0; z < SIZE_Z; z++) {
        // Gentle flattening near spawn (32, 32)
        const distSpawn = Math.hypot(x - 32, z - 32);
        const spawnFlat = Math.max(0, 1 - distSpawn / 11);
        const rawH = 6 + fbm(x, z) * 11;
        const h = Math.round(rawH * (1 - spawnFlat) + 10 * spawnFlat);

        for (let y = 0; y < SIZE_Y; y++) {
          if (y === 0) {
            data[idx(x, y, z)] = B.BEDROCK;
          } else if (y < h - 2) {
            // Underground stone & hidden math ores
            const r = hash2(x * 3.1 + y * 5.7, z * 4.3 + y * 2.1);
            let block = B.STONE;
            if (y <= 5 && r > 0.965) block = B.ORE_NETHERITE;
            else if (y <= 7 && r > 0.945) block = B.ORE_DIAMOND;
            else if (r > 0.925) block = B.ORE_GOLD;
            else if (r > 0.895) block = B.ORE_IRON;
            else if (r > 0.865) block = B.ORE_COAL;
            data[idx(x, y, z)] = block;
          } else if (y < h) {
            data[idx(x, y, z)] = h <= waterLevel + 1 ? B.SAND : B.DIRT;
          } else if (y === h) {
            data[idx(x, y, z)] = h <= waterLevel + 1 ? B.SAND : B.GRASS;
          } else if (y <= waterLevel) {
            data[idx(x, y, z)] = B.WATER;
          }
        }
      }
    }

    // 2. Scatter Oak Trees (avoid spawn clearing and water)
    for (let x = 4; x < SIZE_X - 4; x += 4) {
      for (let z = 4; z < SIZE_Z - 4; z += 4) {
        const ox = x + Math.floor(hash2(x, z) * 3);
        const oz = z + Math.floor(hash2(z, x) * 3);
        if (Math.hypot(ox - 32, oz - 32) < 9) continue;
        const sy = getSurfaceY(ox, oz);
        if (getBlock(ox, sy, oz) === B.GRASS && hash2(ox * 1.7, oz * 2.3) > 0.62) {
          buildTree(ox, sy, oz);
        }
      }
    }

    // 3. Curated Starter Sightlines right around Spawn (32, 32) facing -Z!
    // Starter Coal (Pre-Algebra), Iron (Algebra 1), Emerald (Adaptive) right in view!
    placeOreCluster(30, 26, B.ORE_COAL);
    placeOreCluster(34, 26, B.ORE_IRON);
    placeOreCluster(32, 23, B.ORE_EMERALD);
    placeOreCluster(27, 29, B.ORE_COAL);
    placeOreCluster(37, 29, B.ORE_IRON);

    // Nearby Treasure Chest, ACT Sprint Shrine, Grand Mini-ACT Exam Temple & Boss Arena!
    placeChestPedestal(25, 22);
    placeRuinShrine(39, 19);
    placeExamTemple(22, 31);
    placeBossArena(32, 13);

    // 4. Mid & Outer Ring Ore Outcrops, Chests, and Shrines across the world
    const outcrops = [
      [20, 34, B.ORE_COAL], [44, 34, B.ORE_IRON], [32, 42, B.ORE_EMERALD],
      [18, 20, B.ORE_GOLD], [46, 24, B.ORE_GOLD], [24, 46, B.ORE_GOLD], [42, 46, B.ORE_GOLD],
      [14, 14, B.ORE_DIAMOND], [50, 16, B.ORE_DIAMOND], [14, 50, B.ORE_DIAMOND], [50, 50, B.ORE_DIAMOND],
      [10, 32, B.ORE_EMERALD], [54, 32, B.ORE_EMERALD],
      [8, 10, B.ORE_NETHERITE], [55, 54, B.ORE_NETHERITE], [54, 10, B.ORE_NETHERITE], [10, 54, B.ORE_NETHERITE]
    ];
    outcrops.forEach(([ox, oz, ore]) => {
      if (getSurfaceY(ox, oz) > waterLevel) placeOreCluster(ox, oz, ore);
    });

    // Additional Chests & Shrines
    [[47, 41], [17, 44], [48, 12]].forEach(([cx, cz]) => {
      if (getSurfaceY(cx, cz) > waterLevel) placeChestPedestal(cx, cz);
    });
    [[16, 16], [48, 48]].forEach(([sx, sz]) => {
      if (getSurfaceY(sx, sz) > waterLevel) placeRuinShrine(sx, sz);
    });

    // 5. Re-apply saved player edits
    Object.entries(edits).forEach(([k, val]) => {
      const [x, y, z] = k.split(',').map(Number);
      if (inBounds(x, y, z)) data[idx(x, y, z)] = val;
    });

    // Mark all chunks dirty for initial mesh build
    for (let cx = 0; cx < CHUNKS_X; cx++) {
      for (let cz = 0; cz < CHUNKS_Z; cz++) {
        dirtyChunks.add(`${cx},${cz}`);
      }
    }
  }

  // Spawn a bonus adaptive Emerald Ore near the player (used when practicing a weak spot!)
  function spawnFocusOreNear(px, pz) {
    for (let r = 3; r <= 7; r++) {
      const ang = Math.random() * Math.PI * 2;
      const bx = Math.max(2, Math.min(SIZE_X - 3, Math.round(px + Math.cos(ang) * r)));
      const bz = Math.max(2, Math.min(SIZE_Z - 3, Math.round(pz + Math.sin(ang) * r)));
      const sy = getSurfaceY(bx, bz);
      if (getBlock(bx, sy + 1, bz) === B.AIR && getBlock(bx, sy, bz) !== B.WATER) {
        setBlock(bx, sy + 1, bz, B.ORE_EMERALD, true);
        return { x: bx, y: sy + 1, z: bz };
      }
    }
    return null;
  }

  function isSolid(x, y, z) {
    const id = getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
    return id !== B.AIR && INFO[id] && INFO[id].solid;
  }

  function consumeDirtyChunks() {
    const list = Array.from(dirtyChunks);
    dirtyChunks.clear();
    return list.map(k => k.split(',').map(Number));
  }

  function getEdits() {
    return edits;
  }

  return {
    SIZE_X, SIZE_Y, SIZE_Z, CHUNK_SIZE, CHUNKS_X, CHUNKS_Z,
    generate, getBlock, setBlock, inBounds, isSolid, getSurfaceY,
    consumeDirtyChunks, getEdits, spawnFocusOreNear
  };
})();
