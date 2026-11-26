// Procedural 16x16 pixel-art Minecraft-style texture atlas & Block Registry
window.MathCraft = window.MathCraft || {};

window.MathCraft.Blocks = (function () {
  // Block IDs
  const ID = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    SAND: 6,
    WATER: 7,
    PLANKS: 8,
    COBBLE: 9,
    BRICK: 10,
    GLOWSTONE: 11,
    BEDROCK: 12,
    // Math & Reward Blocks!
    ORE_COAL: 13,      // Tier 1 Math Ore (Pre-Algebra / Easy)
    ORE_IRON: 14,      // Tier 1-2 Math Ore (Algebra 1)
    ORE_GOLD: 15,      // Tier 2-3 Math Ore (Coordinate / Plane Geo)
    ORE_DIAMOND: 16,   // Tier 3-4 Math Ore (Algebra 2 / Harder)
    ORE_EMERALD: 17,   // Adaptive Focus Math Ore (targets weak spots!)
    ORE_NETHERITE: 18, // Tier 4-5 ACT Master Ore (Trig / Hard ACT)
    CHEST: 19,         // Ancient Math Treasure Chest
    SHRINE: 20,        // ACT Sprint Shrine (3-question challenge)
    EXAM_PORTAL: 21    // Grand 12-Question Timed Mini-ACT Exam Portal
  };

  // Texture tile indices inside a 16x16 grid atlas (tile = 16x16px, atlas = 256x256px)
  const TILE = {
    GRASS_TOP: 0,
    GRASS_SIDE: 1,
    DIRT: 2,
    STONE: 3,
    WOOD_SIDE: 4,
    WOOD_TOP: 5,
    LEAVES: 6,
    SAND: 7,
    WATER: 8,
    PLANKS: 9,
    COBBLE: 10,
    BRICK: 11,
    GLOWSTONE: 12,
    BEDROCK: 13,
    ORE_COAL: 14,
    ORE_IRON: 15,
    ORE_GOLD: 16,
    ORE_DIAMOND: 17,
    ORE_EMERALD: 18,
    ORE_NETHERITE: 19,
    CHEST_TOP: 20,
    CHEST_SIDE: 21,
    SHRINE_TOP: 22,
    SHRINE_SIDE: 23,
    EXAM_TOP: 24,
    EXAM_SIDE: 25
  };

  // Metadata per block
  const INFO = {
    [ID.GRASS]: { name: 'Grass Block', top: TILE.GRASS_TOP, side: TILE.GRASS_SIDE, bottom: TILE.DIRT, solid: true, placeable: true, dropId: ID.DIRT, color: '#4ade80' },
    [ID.DIRT]: { name: 'Dirt', top: TILE.DIRT, side: TILE.DIRT, bottom: TILE.DIRT, solid: true, placeable: true, dropId: ID.DIRT, color: '#92400e' },
    [ID.STONE]: { name: 'Stone', top: TILE.STONE, side: TILE.STONE, bottom: TILE.STONE, solid: true, placeable: true, dropId: ID.COBBLE, material: 'stone', color: '#94a3b8' },
    [ID.WOOD]: { name: 'Oak Log', top: TILE.WOOD_TOP, side: TILE.WOOD_SIDE, bottom: TILE.WOOD_TOP, solid: true, placeable: true, dropId: ID.WOOD, material: 'wood', color: '#78350f' },
    [ID.LEAVES]: { name: 'Oak Leaves', top: TILE.LEAVES, side: TILE.LEAVES, bottom: TILE.LEAVES, solid: true, placeable: true, dropId: ID.LEAVES, color: '#16a34a' },
    [ID.SAND]: { name: 'Sand', top: TILE.SAND, side: TILE.SAND, bottom: TILE.SAND, solid: true, placeable: true, dropId: ID.SAND, color: '#fde68a' },
    [ID.WATER]: { name: 'Water', top: TILE.WATER, side: TILE.WATER, bottom: TILE.WATER, solid: false, liquid: true, placeable: false, color: '#38bdf8' },
    [ID.PLANKS]: { name: 'Oak Planks', top: TILE.PLANKS, side: TILE.PLANKS, bottom: TILE.PLANKS, solid: true, placeable: true, dropId: ID.PLANKS, color: '#b45309' },
    [ID.COBBLE]: { name: 'Cobblestone', top: TILE.COBBLE, side: TILE.COBBLE, bottom: TILE.COBBLE, solid: true, placeable: true, dropId: ID.COBBLE, material: 'stone', color: '#64748b' },
    [ID.BRICK]: { name: 'Red Bricks', top: TILE.BRICK, side: TILE.BRICK, bottom: TILE.BRICK, solid: true, placeable: true, dropId: ID.BRICK, color: '#b91c1c' },
    [ID.GLOWSTONE]: { name: 'Glowstone Lamp', top: TILE.GLOWSTONE, side: TILE.GLOWSTONE, bottom: TILE.GLOWSTONE, solid: true, placeable: true, dropId: ID.GLOWSTONE, color: '#fde047' },
    [ID.BEDROCK]: { name: 'Bedrock', top: TILE.BEDROCK, side: TILE.BEDROCK, bottom: TILE.BEDROCK, solid: true, unbreakable: true, color: '#1e293b' },

    // Math Ores & Interactive Structures
    [ID.ORE_COAL]: {
      name: 'Coal Math Ore (Pre-Algebra)', top: TILE.ORE_COAL, side: TILE.ORE_COAL, bottom: TILE.ORE_COAL,
      solid: true, isMath: true, domain: 'number', minPickaxe: 1, baseGems: 18, baseXp: 25,
      materialDrop: { stone: 2 }, color: '#475569'
    },
    [ID.ORE_IRON]: {
      name: 'Iron Math Ore (Algebra 1)', top: TILE.ORE_IRON, side: TILE.ORE_IRON, bottom: TILE.ORE_IRON,
      solid: true, isMath: true, domain: 'algebra1', minPickaxe: 1, baseGems: 26, baseXp: 35,
      materialDrop: { iron: 2 }, color: '#cbd5e1'
    },
    [ID.ORE_GOLD]: {
      name: 'Gold Math Ore (Geometry)', top: TILE.ORE_GOLD, side: TILE.ORE_GOLD, bottom: TILE.ORE_GOLD,
      solid: true, isMath: true, domain: 'plane_geo', minPickaxe: 2, baseGems: 38, baseXp: 48,
      materialDrop: { gold: 2 }, color: '#facc15'
    },
    [ID.ORE_EMERALD]: {
      name: 'Emerald Focus Ore (Adaptive)', top: TILE.ORE_EMERALD, side: TILE.ORE_EMERALD, bottom: TILE.ORE_EMERALD,
      solid: true, isMath: true, domain: 'adaptive', minPickaxe: 1, baseGems: 42, baseXp: 55,
      materialDrop: { iron: 1, gold: 1 }, color: '#22c55e'
    },
    [ID.ORE_DIAMOND]: {
      name: 'Diamond Math Ore (Algebra 2 & Coord)', top: TILE.ORE_DIAMOND, side: TILE.ORE_DIAMOND, bottom: TILE.ORE_DIAMOND,
      solid: true, isMath: true, domain: 'algebra2_coord', minPickaxe: 3, baseGems: 60, baseXp: 75,
      materialDrop: { diamond: 2 }, color: '#38bdf8'
    },
    [ID.ORE_NETHERITE]: {
      name: 'ACT Rune Ore (Trig & Stats)', top: TILE.ORE_NETHERITE, side: TILE.ORE_NETHERITE, bottom: TILE.ORE_NETHERITE,
      solid: true, isMath: true, domain: 'trig_stats', minPickaxe: 4, baseGems: 85, baseXp: 105,
      materialDrop: { diamond: 3, gold: 2 }, color: '#c084fc'
    },
    [ID.CHEST]: {
      name: 'Ancient Math Chest', top: TILE.CHEST_TOP, side: TILE.CHEST_SIDE, bottom: TILE.CHEST_TOP,
      solid: true, isMath: true, isChest: true, domain: 'adaptive', minPickaxe: 1, baseGems: 75, baseXp: 90,
      materialDrop: { iron: 2, gold: 2, diamond: 1 }, color: '#f59e0b'
    },
    [ID.SHRINE]: {
      name: 'ACT Sprint Shrine (3-Question Blitz)', top: TILE.SHRINE_TOP, side: TILE.SHRINE_SIDE, bottom: TILE.SHRINE_TOP,
      solid: true, isMath: true, isShrine: true, domain: 'adaptive', minPickaxe: 1, baseGems: 150, baseXp: 180,
      materialDrop: { gold: 3, diamond: 2 }, color: '#a855f7'
    },
    [ID.EXAM_PORTAL]: {
      name: 'Grand Mini-ACT Exam Altar (12 Qs • 12 Min)', top: TILE.EXAM_TOP, side: TILE.EXAM_SIDE, bottom: TILE.EXAM_TOP,
      solid: true, isMath: true, isExamPortal: true, minPickaxe: 1, baseGems: 350, baseXp: 400,
      color: '#38bdf8'
    }
  };

  // Seeded pseudo-random for crisp deterministic pixel textures
  function hash(x, y, s) {
    let n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function hexToRgb(hex) {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  function shade(rgb, delta) {
    return [
      Math.max(0, Math.min(255, rgb[0] + delta)),
      Math.max(0, Math.min(255, rgb[1] + delta)),
      Math.max(0, Math.min(255, rgb[2] + delta))
    ];
  }

  function buildAtlas() {
    const tileSize = 16;
    const cols = 16;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize * cols;
    canvas.height = tileSize * cols;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(canvas.width, canvas.height);
    const data = img.data;

    function setPx(tileIdx, lx, ly, rgb, alpha = 255) {
      const tx = (tileIdx % cols) * tileSize;
      const ty = Math.floor(tileIdx / cols) * tileSize;
      const idx = ((ty + ly) * canvas.width + (tx + lx)) * 4;
      data[idx] = rgb[0];
      data[idx + 1] = rgb[1];
      data[idx + 2] = rgb[2];
      data[idx + 3] = alpha;
    }

    function fillNoise(tileIdx, baseHex, variance, seed) {
      const base = hexToRgb(baseHex);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const n = (hash(x, y, seed) - 0.5) * 2 * variance;
          setPx(tileIdx, x, y, shade(base, n));
        }
      }
    }

    function drawOre(tileIdx, speckHex, glowHex, seed) {
      fillNoise(tileIdx, '#7c8594', 18, seed);
      const speck = hexToRgb(speckHex);
      const glow = hexToRgb(glowHex);
      const spots = [
        [3, 3], [4, 3], [3, 4], [10, 4], [11, 4], [11, 5],
        [6, 8], [7, 8], [7, 9], [8, 9], [3, 11], [4, 12],
        [11, 11], [12, 11], [12, 12], [5, 6]
      ];
      spots.forEach(([x, y], i) => {
        setPx(tileIdx, x, y, i % 3 === 0 ? glow : speck);
      });
    }

    // 0: Grass Top
    fillNoise(TILE.GRASS_TOP, '#52b74a', 22, 1);
    // 1: Grass Side
    fillNoise(TILE.GRASS_SIDE, '#855838', 18, 2);
    for (let x = 0; x < 16; x++) {
      const drip = 3 + Math.floor(hash(x, 0, 9) * 3);
      for (let y = 0; y < drip; y++) {
        const g = shade(hexToRgb('#52b74a'), (hash(x, y, 10) - 0.5) * 24);
        setPx(TILE.GRASS_SIDE, x, y, g);
      }
    }
    // 2: Dirt
    fillNoise(TILE.DIRT, '#855838', 20, 3);
    // 3: Stone
    fillNoise(TILE.STONE, '#7f8794', 17, 4);
    // 4: Wood Side
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const stripe = (x % 4 === 0) ? -18 : (x % 4 === 2 ? 8 : 0);
        const n = (hash(x, y, 5) - 0.5) * 16 + stripe;
        setPx(TILE.WOOD_SIDE, x, y, shade(hexToRgb('#6b4423'), n));
      }
    }
    // 5: Wood Top (rings)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const d = Math.hypot(x - 7.5, y - 7.5);
        const edge = (x === 0 || y === 0 || x === 15 || y === 15);
        const col = edge ? '#59371b' : (Math.floor(d) % 2 === 0 ? '#c49a6c' : '#a87e51');
        setPx(TILE.WOOD_TOP, x, y, shade(hexToRgb(col), (hash(x, y, 6) - 0.5) * 12));
      }
    }
    // 6: Leaves
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const r = hash(x, y, 7);
        const col = r < 0.25 ? '#1f6f31' : (r < 0.72 ? '#2e9e44' : '#43be58');
        setPx(TILE.LEAVES, x, y, hexToRgb(col));
      }
    }
    // 7: Sand
    fillNoise(TILE.SAND, '#e6d39c', 14, 8);
    // 8: Water
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const wave = Math.sin((x + y) * 0.6) * 14;
        setPx(TILE.WATER, x, y, shade(hexToRgb('#2596be'), wave));
      }
    }
    // 9: Planks
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const seam = (y % 4 === 0) || (x === ((Math.floor(y / 4) * 7) % 16));
        const base = seam ? '#7a5229' : '#c08b4b';
        setPx(TILE.PLANKS, x, y, shade(hexToRgb(base), (hash(x, y, 12) - 0.5) * 14));
      }
    }
    // 10: Cobble
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const crack = ((x + y * 2) % 7 === 0) || ((x * 3 + y) % 11 === 0);
        const base = crack ? '#475569' : '#8b95a5';
        setPx(TILE.COBBLE, x, y, shade(hexToRgb(base), (hash(x, y, 13) - 0.5) * 20));
      }
    }
    // 11: Brick
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const mortarY = y % 4 === 0;
        const row = Math.floor(y / 4);
        const mortarX = (x + (row % 2) * 4) % 8 === 0;
        const col = (mortarY || mortarX) ? '#cbd5e1' : '#b44332';
        setPx(TILE.BRICK, x, y, shade(hexToRgb(col), (hash(x, y, 14) - 0.5) * 16));
      }
    }
    // 12: Glowstone
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const r = hash(x, y, 15);
        const col = r < 0.25 ? '#b45309' : (r < 0.6 ? '#facc15' : '#fef08a');
        setPx(TILE.GLOWSTONE, x, y, hexToRgb(col));
      }
    }
    // 13: Bedrock
    fillNoise(TILE.BEDROCK, '#272c36', 24, 16);

    // 14-19: Math Ores
    drawOre(TILE.ORE_COAL, '#1e293b', '#334155', 21);
    drawOre(TILE.ORE_IRON, '#e2e8f0', '#f8fafc', 22);
    drawOre(TILE.ORE_GOLD, '#eab308', '#fef08a', 23);
    drawOre(TILE.ORE_DIAMOND, '#0ea5e9', '#7dd3fc', 24);
    drawOre(TILE.ORE_EMERALD, '#16a34a', '#86efac', 25);
    // ACT Rune Ore (Obsidian + Purple/Gold runes)
    fillNoise(TILE.ORE_NETHERITE, '#2e1065', 16, 26);
    [[3,3],[4,3],[11,3],[12,3],[7,6],[8,6],[6,7],[9,7],[7,8],[8,8],[4,12],[11,12],[7,11],[8,11]].forEach(([x,y], i) => {
      setPx(TILE.ORE_NETHERITE, x, y, hexToRgb(i % 2 === 0 ? '#e879f9' : '#facc15'));
    });

    // 20-21: Treasure Chest
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const border = x === 0 || x === 15 || y === 0 || y === 15;
        const cTop = border ? '#523015' : '#b46924';
        setPx(TILE.CHEST_TOP, x, y, shade(hexToRgb(cTop), (hash(x, y, 30) - 0.5) * 12));

        let cSide = border ? '#523015' : '#b46924';
        if (y === 6) cSide = '#3b200c';
        if (x >= 6 && x <= 9 && y >= 5 && y <= 8) cSide = '#facc15';
        setPx(TILE.CHEST_SIDE, x, y, shade(hexToRgb(cSide), (hash(x, y, 31) - 0.5) * 10));
      }
    }

    // 22-23: ACT Shrine (marble & glowing violet-gold pillar)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const frame = x <= 1 || x >= 14 || y <= 1 || y >= 14;
        const center = x >= 5 && x <= 10 && y >= 5 && y <= 10;
        const colTop = frame ? '#eab308' : (center ? '#a855f7' : '#e2e8f0');
        setPx(TILE.SHRINE_TOP, x, y, shade(hexToRgb(colTop), (hash(x, y, 32) - 0.5) * 10));

        const colSide = (x <= 1 || x >= 14) ? '#cbd5e1' : ((y === 2 || y === 13) ? '#eab308' : ((x >= 6 && x <= 9 && y >= 4 && y <= 11) ? '#c084fc' : '#334155'));
        setPx(TILE.SHRINE_SIDE, x, y, shade(hexToRgb(colSide), (hash(x, y, 33) - 0.5) * 10));
      }
    }

    // 24-25: Grand Mini-ACT Exam Portal (Gold frame + shimmering diamond core)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const outer = x <= 1 || x >= 14 || y <= 1 || y >= 14;
        const inner = x >= 4 && x <= 11 && y >= 4 && y <= 11;
        const swirl = ((x + y) % 3 === 0) ? '#7dd3fc' : '#0284c7';
        const cTop = outer ? '#facc15' : (inner ? swirl : '#1e3a8a');
        setPx(TILE.EXAM_TOP, x, y, shade(hexToRgb(cTop), (hash(x, y, 34) - 0.5) * 10));

        const pillar = x <= 1 || x >= 14 || y <= 1 || y >= 14;
        const core = x >= 4 && x <= 11 && y >= 3 && y <= 12;
        const cSide = pillar ? '#facc15' : (core ? (((x * 2 + y) % 4 === 0) ? '#bae6fd' : '#0ea5e9') : '#1e293b');
        setPx(TILE.EXAM_SIDE, x, y, shade(hexToRgb(cSide), (hash(x, y, 35) - 0.5) * 10));
      }
    }

    ctx.putImageData(img, 0, 0);
    return { canvas, cols, tileSize };
  }

  // Generate a small 32x32 isometric/flat icon dataURL for hotbar slots
  let cachedAtlas = null;
  const iconCache = {};
  function getAtlas() {
    if (!cachedAtlas) cachedAtlas = buildAtlas();
    return cachedAtlas;
  }

  function getBlockIcon(blockId) {
    if (iconCache[blockId]) return iconCache[blockId];
    const info = INFO[blockId];
    if (!info) return '';
    const { canvas, cols, tileSize } = getAtlas();
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const t = info.side;
    const sx = (t % cols) * tileSize;
    const sy = Math.floor(t / cols) * tileSize;
    ctx.drawImage(canvas, sx, sy, tileSize, tileSize, 0, 0, 32, 32);
    // subtle top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(0, 0, 32, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, 28, 32, 4);
    const url = c.toDataURL();
    iconCache[blockId] = url;
    return url;
  }

  return { ID, TILE, INFO, getAtlas, getBlockIcon };
})();
