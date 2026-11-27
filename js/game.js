// Main Game Coordinator: Progression, Crafting, Quests, Adaptive Math UI & Save System
window.MathCraft = window.MathCraft || {};

(function () {
  const AudioFX = window.MathCraft.Audio;
  const Blocks = window.MathCraft.Blocks;
  const B = Blocks.ID;
  const INFO = Blocks.INFO;
  const MathEngine = window.MathCraft.MathEngine;
  const World = window.MathCraft.World;
  const Mobs = window.MathCraft.Mobs;
  const Engine = window.MathCraft.Engine3D;

  const SAVE_KEY = 'mathcraft_act_save_v1';

  // ==================== PROGRESSION & CRAFTING DATA ====================
  const PICKAXES = [
    { tier: 1, name: 'Wooden Pickaxe', color: '#b45309', gemMult: 1.0, cost: null, desc: 'Starter tool. Mines Coal, Iron, Emerald Ores & Chests.' },
    { tier: 2, name: 'Stone Pickaxe', color: '#94a3b8', gemMult: 1.2, cost: { gems: 45, stone: 4 }, desc: 'Unlocks Gold Math Ore (Geometry) + 20% bonus Gems.' },
    { tier: 3, name: 'Iron Pickaxe', color: '#e2e8f0', gemMult: 1.45, cost: { gems: 110, iron: 4 }, desc: 'Unlocks Diamond Math Ore (Algebra 2 & Coord) + 45% Gems.' },
    { tier: 4, name: 'Gold Pickaxe', color: '#facc15', gemMult: 1.75, cost: { gems: 200, gold: 4 }, desc: 'Unlocks ACT Rune Ore (Trig & Stats) + 75% bonus Gems.' },
    { tier: 5, name: 'Diamond ACT Pickaxe', color: '#38bdf8', gemMult: 2.1, cost: { gems: 340, diamond: 5 }, desc: 'Master miner! +110% bonus Gems on every problem.' },
    { tier: 6, name: 'Netherite 36 Pickaxe', color: '#c084fc', gemMult: 2.6, cost: { gems: 550, diamond: 10, gold: 6 }, desc: 'Legendary ACT Scholar pickaxe! +160% Gems!' }
  ];

  const PERKS = [
    { id: 'speed_boots', name: 'Swift Explorer Boots', icon: '🥾', cost: { gems: 60, iron: 2 }, desc: 'Increases walking & sprinting speed by +35% across the world.' },
    { id: 'jump_charm', name: 'Cloud Jump Charm', icon: '🪽', cost: { gems: 80, gold: 2 }, desc: 'Jump higher (+35%) to easily scale cliffs and ore mountains.' },
    { id: 'gem_magnet', name: 'Scholar Gem Multiplier', icon: '🧲', cost: { gems: 120, iron: 3, gold: 2 }, desc: 'Permanently boosts Math Gem & XP rewards by an extra +30%.' },
    { id: 'summon_ore', name: 'Summon Adaptive Focus Ores', icon: '💚', repeatable: true, cost: { gems: 25 }, desc: 'Spawns 3 glowing Emerald Focus Ores near you targeting your weak spots!' },
    { id: 'summon_boss', name: 'Summon ACT Math Titan Boss', icon: '👑', repeatable: true, cost: { gems: 40 }, desc: 'Respawns the 5-HP ACT Math Titan in the Boss Arena straight ahead!' }
  ];

  const BLOCK_RECIPES = [
    { blockId: B.PLANKS, amount: 8, cost: { wood: 2 }, desc: 'Warm oak planks for building your ACT Study Base.' },
    { blockId: B.COBBLE, amount: 8, cost: { stone: 2 }, desc: 'Sturdy cobblestone blocks for towers and bridges.' },
    { blockId: B.BRICK, amount: 8, cost: { gems: 15, stone: 2 }, desc: 'Decorative red bricks for castles and halls.' },
    { blockId: B.GLOWSTONE, amount: 4, cost: { gems: 20 }, desc: 'Glowing golden lantern blocks to light up your builds!' }
  ];

  const QUESTS = [
    { id: 'q1', text: 'Mine 3 glowing Math Ore blocks', target: 3, rewardGems: 50, rewardXp: 60, track: 'oresMined' },
    { id: 'q2', text: 'Defeat a roaming Math Mob (click a Slime!)', target: 1, rewardGems: 60, rewardXp: 75, track: 'mobsDefeated' },
    { id: 'q3', text: 'Craft a Stone Pickaxe (press C)', target: 2, rewardGems: 70, rewardXp: 85, track: 'pickaxeTier' },
    { id: 'q4', text: 'Reach a 4-question answer streak', target: 4, rewardGems: 85, rewardXp: 100, track: 'bestStreak' },
    { id: 'q5', text: 'Open an Ancient Math Treasure Chest', target: 1, rewardGems: 95, rewardXp: 110, track: 'chestsOpened' },
    { id: 'q6', text: 'Complete a 12-Q Timed Mini-ACT Exam [T]', target: 1, rewardGems: 160, rewardXp: 200, track: 'examsDone' },
    { id: 'q7', text: 'Defeat the ACT Math Titan Boss (north arena!)', target: 1, rewardGems: 250, rewardXp: 300, track: 'bossesDefeated' },
    { id: 'q8', text: 'Reach Estimated ACT Math Score of 28+', target: 28, rewardGems: 320, rewardXp: 380, track: 'actScore' }
  ];

  // ==================== GAME STATE ====================
  function createFreshState() {
    return {
      level: 1,
      xp: 0,
      gems: 20,
      pickaxeTier: 1,
      perks: {},
      materials: { wood: 4, stone: 2, iron: 0, gold: 0, diamond: 0 },
      hotbar: [
        { id: B.DIRT, count: 12 },
        { id: B.PLANKS, count: 12 },
        { id: B.COBBLE, count: 8 },
        { id: B.WOOD, count: 4 },
        { id: B.BRICK, count: 4 },
        { id: B.GLOWSTONE, count: 4 },
        { id: B.GRASS, count: 0 },
        { id: B.SAND, count: 0 },
        { id: B.LEAVES, count: 0 }
      ],
      selectedSlot: 0,
      questIdx: 0,
      stats: {
        oresMined: 0,
        chestsOpened: 0,
        shrinesDone: 0,
        mobsDefeated: 0,
        bossesDefeated: 0,
        examsDone: 0,
        bestExamScore: 0
      }
    };
  }

  let state = createFreshState();
  let gameStarted = false;
  let activeModal = null; // 'title' | 'math' | 'lesson' | 'craft' | 'journal' | 'exam' | null
  let currentCraftTab = 'pickaxes';

  // Active Math Challenge Session
  let mathSession = null;

  // Active Lesson Session
  let lessonSession = null;

  // Active Timed Mini-ACT Exam Session
  let examSession = null;

  // Auto-detect touch/iPhone device, or allow manual toggle
  let touchMode = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 820);

  // ==================== DOM REFS ====================
  const $ = id => document.getElementById(id);

  function showToast(msg, variant = '') {
    const el = document.createElement('div');
    el.className = `toast ${variant}`;
    el.textContent = msg;
    $('toastContainer').appendChild(el);
    setTimeout(() => el.remove(), 3050);
  }

  // ==================== SAVE / LOAD ====================
  function saveGame() {
    try {
      const payload = {
        state,
        profile: MathEngine.getProfile(),
        edits: World.getEdits()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (_) {}
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.state) {
        state = {
          ...createFreshState(),
          ...parsed.state,
          materials: { ...createFreshState().materials, ...(parsed.state.materials || {}) },
          stats: { ...createFreshState().stats, ...(parsed.state.stats || {}) },
          perks: parsed.state.perks || {}
        };
      }
      if (parsed.profile) MathEngine.loadProfile(parsed.profile);
      return parsed.edits || null;
    } catch (_) {
      return null;
    }
  }

  function resetAllProgress() {
    if (!confirm('Reset your world, inventory, and ACT math progress?')) return;
    localStorage.removeItem(SAVE_KEY);
    state = createFreshState();
    MathEngine.resetProfile();
    World.generate(null);
    Mobs.initWorldMobs();
    applyPerksToEngine();
    refreshAllUI();
    showToast('Progress reset! Fresh world generated.', 'gold');
    $('btnResetSave').style.display = 'none';
  }

  // ==================== MODAL MANAGEMENT ====================
  function setModal(name) {
    activeModal = name;
    const modals = {
      title: $('titleOverlay'),
      math: $('mathModal'),
      lesson: $('lessonModal'),
      craft: $('craftModal'),
      journal: $('journalModal'),
      exam: $('examModal')
    };
    Object.entries(modals).forEach(([k, el]) => {
      if (k === name) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });

    const inWorld = (name === null && gameStarted);
    if (inWorld && document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    Engine.setPaused(!inWorld);
    $('crosshair').classList.toggle('hidden', !inWorld);
    $('handCanvas').classList.toggle('hidden', !inWorld);
    $('hudTop').classList.toggle('hidden', !gameStarted);
    $('hotbarWrap').classList.toggle('hidden', !gameStarted);
    $('mobLabelsLayer').classList.toggle('hidden', !inWorld);
    $('touchControls').classList.toggle('hidden', !(inWorld && touchMode));
    if (!inWorld) {
      $('targetInfo').classList.add('hidden');
      $('bossBarWrap').classList.add('hidden');
    }
  }

  // ==================== PROGRESSION & HUD ====================
  function xpForNextLevel(lvl) {
    return 100 + (lvl - 1) * 65;
  }

  function addXp(amount) {
    state.xp += amount;
    while (state.xp >= xpForNextLevel(state.level)) {
      state.xp -= xpForNextLevel(state.level);
      state.level += 1;
      state.gems += 25;
      AudioFX.playLevelUp();
      showToast(`⭐ LEVEL UP! You reached Level ${state.level} (+25 Bonus 💎)!`, 'gold');
    }
  }

  function addHotbarBlock(blockId, count = 1) {
    if (!INFO[blockId] || !INFO[blockId].placeable) return;
    let slot = state.hotbar.find(s => s.id === blockId);
    if (slot) {
      slot.count += count;
    } else {
      slot = state.hotbar.find(s => s.count === 0);
      if (slot) {
        slot.id = blockId;
        slot.count = count;
      }
    }
    renderHotbar();
  }

  function applyPerksToEngine() {
    const pick = PICKAXES[state.pickaxeTier - 1] || PICKAXES[0];
    Engine.setPickaxeVisual(pick.color);
    Engine.player.speedMult = state.perks.speed_boots ? 1.35 : 1.0;
    Engine.player.jumpMult = state.perks.jump_charm ? 1.35 : 1.0;
  }

  function getQuestProgress(q) {
    const prof = MathEngine.getProfile();
    switch (q.track) {
      case 'oresMined': return state.stats.oresMined;
      case 'mobsDefeated': return state.stats.mobsDefeated || 0;
      case 'bossesDefeated': return state.stats.bossesDefeated || 0;
      case 'examsDone': return state.stats.examsDone || 0;
      case 'pickaxeTier': return state.pickaxeTier;
      case 'bestStreak': return prof.bestStreak;
      case 'chestsOpened': return state.stats.chestsOpened;
      case 'shrinesDone': return state.stats.shrinesDone;
      case 'actScore': return MathEngine.getEstimatedActScore();
      case 'totalCorrect': return prof.totalCorrect;
      default: return 0;
    }
  }

  function checkQuestCompletion() {
    while (state.questIdx < QUESTS.length) {
      const q = QUESTS[state.questIdx];
      if (getQuestProgress(q) >= q.target) {
        state.gems += q.rewardGems;
        addXp(q.rewardXp);
        AudioFX.playLevelUp();
        showToast(`🏆 Quest Complete: ${q.text} (+${q.rewardGems} 💎)`, 'gold');
        state.questIdx += 1;
      } else {
        break;
      }
    }
  }

  function refreshHUD() {
    const pick = PICKAXES[state.pickaxeTier - 1] || PICKAXES[0];
    const prof = MathEngine.getProfile();
    const actScore = MathEngine.getEstimatedActScore();

    $('hudLevel').textContent = `LVL ${state.level}`;
    $('hudPickaxe').textContent = `${pick.name} (Tier ${pick.tier})`;
    const need = xpForNextLevel(state.level);
    $('hudXpBar').style.width = `${Math.min(100, Math.round((state.xp / need) * 100))}%`;
    $('hudXpText').textContent = `${state.xp} / ${need} XP`;

    $('hudActScore').textContent = actScore;
    $('hudStreak').textContent = prof.streak;
    $('hudGems').textContent = state.gems;

    // Average active tier across domains
    const tiers = Object.values(prof.domains).map(d => d.tier);
    const avgTier = Math.round(tiers.reduce((a, b) => a + b, 0) / tiers.length);
    $('hudTier').textContent = avgTier;

    // Quest box
    const q = QUESTS[state.questIdx];
    if (q) {
      const cur = Math.min(q.target, getQuestProgress(q));
      $('questText').textContent = q.text;
      $('questReward').textContent = `+${q.rewardGems} 💎`;
      $('questBar').style.width = `${Math.round((cur / q.target) * 100)}%`;
      $('questCount').textContent = `${cur} / ${q.target}`;
    } else {
      $('questText').textContent = 'All Story Quests Done! Aim for ACT 36!';
      $('questReward').textContent = '🏆 MASTER';
      $('questBar').style.width = '100%';
      $('questCount').textContent = 'MAX';
    }

    // Active buffs
    const buffs = [];
    if (state.perks.champion_crown) buffs.push('👑 Champion Crown (+25% 💎)');
    if (state.perks.speed_boots) buffs.push('🥾 Speed +35%');
    if (state.perks.jump_charm) buffs.push('🪽 Jump +35%');
    if (state.perks.gem_magnet) buffs.push('🧲 Gems +30%');
    if (prof.streak >= 3) buffs.push(`🔥 ${prof.streak}x Streak Bonus`);
    $('activeBuffs').innerHTML = buffs.map(b => `<span class="buff-pill">${b}</span>`).join('');

    // Gap alert pill
    const gaps = MathEngine.getTopGaps(1);
    if (gameStarted && gaps.length > 0 && activeModal === null) {
      $('gapAlert').classList.remove('hidden');
      $('gapAlertText').textContent = `Stuck spot detected: ${gaps[0].lesson.title}`;
      $('btnOpenGapLesson').onclick = () => openLesson(gaps[0].gapId);
    } else {
      $('gapAlert').classList.add('hidden');
    }
  }

  function renderHotbar() {
    const bar = $('hotbar');
    bar.innerHTML = '';
    state.hotbar.forEach((slot, i) => {
      const div = document.createElement('div');
      div.className = `hotbar-slot ${i === state.selectedSlot ? 'selected' : ''}`;
      const info = INFO[slot.id];
      const iconUrl = slot.count > 0 ? Blocks.getBlockIcon(slot.id) : '';
      div.innerHTML = `
        <span class="slot-key">${i + 1}</span>
        ${iconUrl ? `<img class="slot-icon" src="${iconUrl}" alt="" />` : ''}
        ${slot.count > 0 ? `<span class="slot-count">${slot.count}</span>` : ''}
        <span class="slot-label-tip">${info && slot.count > 0 ? info.name : 'Empty Slot'}</span>
      `;
      div.addEventListener('click', () => {
        state.selectedSlot = i;
        renderHotbar();
      });
      bar.appendChild(div);
    });
  }

  function refreshAllUI() {
    checkQuestCompletion();
    refreshHUD();
    renderHotbar();
    saveGame();
  }

  // ==================== WORLD INTERACTIONS (MINE, MOBS & PLACE) ====================
  function onTargetChange(hit) {
    const el = $('targetInfo');
    if (!hit || activeModal !== null) {
      el.classList.add('hidden');
      return;
    }
    if (hit.isMob && hit.mob && hit.mob.alive) {
      const m = hit.mob;
      el.classList.remove('hidden');
      $('targetName').textContent = `${m.def.name}  (${'❤️'.repeat(m.hp)}${'🖤'.repeat(m.maxHp - m.hp)})`;
      $('targetHint').textContent = m.def.isBoss
        ? `⚔️ Left-click to strike the Boss with ACT Math! (+${m.def.baseGems} 💎 on defeat)`
        : `⚔️ Left-click to battle with ACT Math! (+${m.def.baseGems} 💎)`;
      $('targetHint').style.color = m.def.isBoss ? '#fde047' : '#86efac';
      return;
    }
    const info = INFO[hit.id];
    if (!info) {
      el.classList.add('hidden');
      return;
    }
    el.classList.remove('hidden');
    $('targetName').textContent = info.name;
    if (info.isExamPortal) {
      $('targetHint').textContent = '⏱️ Left-click to launch 12-Question Timed Mini-ACT Exam!';
      $('targetHint').style.color = '#7dd3fc';
    } else if (info.isMath) {
      if (state.pickaxeTier < info.minPickaxe) {
        const req = PICKAXES[info.minPickaxe - 1];
        $('targetHint').textContent = `🔒 Needs ${req.name} (Tier ${req.tier}) — Craft with [C]`;
        $('targetHint').style.color = '#fca5a5';
      } else {
        $('targetHint').textContent = info.isShrine
          ? '⚡ Left-click to start 3-Question ACT Sprint!'
          : `💎 Left-click to solve ACT Math & mine (+${info.baseGems} 💎)`;
        $('targetHint').style.color = '#86efac';
      }
    } else if (info.unbreakable) {
      $('targetHint').textContent = 'Unbreakable world floor';
      $('targetHint').style.color = '#94a3b8';
    } else {
      $('targetHint').textContent = 'Left-click to mine • Right-click / F to place block';
      $('targetHint').style.color = '#cbd5e1';
    }
  }

  function handleHitMob(mob) {
    if (!mob || !mob.alive) return;
    openMathChallenge({
      targetMob: mob,
      sourceName: `⚔️ ${mob.def.name} (${mob.hp}/${mob.maxHp} HP)`,
      domain: mob.def.domain,
      baseGems: mob.def.baseGems,
      baseXp: mob.def.baseXp,
      materialDrop: mob.def.materialDrop
    });
  }

  function handleMine(hit) {
    const info = INFO[hit.id];
    if (!info || info.unbreakable) return;

    if (info.isExamPortal) {
      openExamModal();
      return;
    }

    if (info.isMath) {
      if (state.pickaxeTier < info.minPickaxe) {
        const req = PICKAXES[info.minPickaxe - 1];
        AudioFX.playWrong();
        showToast(`🔒 Craft a ${req.name} (Press C) to mine ${info.name}!`, 'danger');
        return;
      }
      openMathChallenge({
        targetBlock: hit,
        sourceName: info.name,
        domain: info.domain,
        baseGems: info.baseGems,
        baseXp: info.baseXp,
        materialDrop: info.materialDrop,
        isShrine: !!info.isShrine,
        isChest: !!info.isChest
      });
      return;
    }

    // Standard Minecraft block mining
    World.setBlock(hit.x, hit.y, hit.z, B.AIR, true);
    Engine.spawnBreakParticles(hit.x, hit.y, hit.z, info.color || '#94a3b8');
    AudioFX.playMine();

    if (info.dropId) addHotbarBlock(info.dropId, 1);
    if (info.material) {
      state.materials[info.material] = (state.materials[info.material] || 0) + 1;
    }
    saveGame();
  }

  function handlePlace(pos) {
    const slot = state.hotbar[state.selectedSlot];
    if (!slot || slot.count <= 0) return;
    if (!World.inBounds(pos.x, pos.y, pos.z)) return;
    if (World.getBlock(pos.x, pos.y, pos.z) !== B.AIR && World.getBlock(pos.x, pos.y, pos.z) !== B.WATER) return;
    if (Engine.isPlayerOverlappingBlock(pos.x, pos.y, pos.z)) return;

    World.setBlock(pos.x, pos.y, pos.z, slot.id, true);
    slot.count -= 1;
    AudioFX.playPlace();
    renderHotbar();
    saveGame();
  }

  // ==================== MATH CHALLENGE MODAL ====================
  function openMathChallenge(opts) {
    AudioFX.playOpenChallenge();
    const sprintTotal = opts.isShrine ? 3 : 1;
    mathSession = {
      ...opts,
      sprintTotal,
      sprintStep: 1,
      sprintCorrect: 0,
      timerId: null
    };
    loadNextMathQuestion();
    setModal('math');
  }

  function loadNextMathQuestion() {
    if (!mathSession) return;
    if (mathSession.timerId) clearInterval(mathSession.timerId);

    let q;
    if (mathSession.topicId) {
      q = MathEngine.generateTopicQuestion(mathSession.topicId);
    } else if (mathSession.domain === 'advanced_topic') {
      const adv = ['logarithms', 'complex_numbers', 'matrices', 'conic_sections', 'sequences_series'];
      q = MathEngine.generateTopicQuestion(adv[Math.floor(Math.random() * adv.length)]);
    } else if (mathSession.domain === 'boss_mix') {
      if (Math.random() < 0.55) {
        const adv = ['logarithms', 'complex_numbers', 'matrices', 'conic_sections', 'sequences_series'];
        q = MathEngine.generateTopicQuestion(adv[Math.floor(Math.random() * adv.length)]);
      } else {
        q = MathEngine.generateQuestion('adaptive', Math.min(5, Math.max(2, state.pickaxeTier + 1)));
      }
    } else {
      q = MathEngine.generateQuestion(mathSession.domain, mathSession.forcedTier || null);
    }
    mathSession.question = q;
    mathSession.answered = false;
    mathSession.startTime = Date.now();

    // Header tags
    if (mathSession.targetMob) {
      const m = mathSession.targetMob;
      $('mathSourceTag').textContent = `⚔️ ${m.def.name} (${m.hp}/${m.maxHp} HP)`;
    } else {
      $('mathSourceTag').textContent = mathSession.sourceName || '📘 Targeted Practice';
    }
    $('mathDomainTag').textContent = q.domainName;
    $('mathTierTag').textContent = `Tier ${q.tier} • ${q.tierLabel}`;

    const pick = PICKAXES[state.pickaxeTier - 1] || PICKAXES[0];
    const mult = pick.gemMult * (state.perks.gem_magnet ? 1.3 : 1.0);
    const estGems = Math.round((mathSession.baseGems || 25) * mult);
    $('mathRewardPreview').textContent = `+${estGems} 💎 • +${mathSession.baseXp || 30} XP`;

    // Sprint banner
    if (mathSession.sprintTotal > 1) {
      $('sprintBanner').classList.remove('hidden');
      $('sprintStepText').textContent = `Question ${mathSession.sprintStep} of ${mathSession.sprintTotal} (${mathSession.sprintCorrect} right)`;
    } else {
      $('sprintBanner').classList.add('hidden');
    }

    // Question prompt & optional SVG diagram
    $('questionPrompt').textContent = q.prompt;
    if (q.diagram) {
      $('questionDiagram').innerHTML = q.diagram;
      $('questionDiagram').classList.remove('hidden');
    } else {
      $('questionDiagram').innerHTML = '';
      $('questionDiagram').classList.add('hidden');
    }

    // Reset hint & feedback
    $('hintBox').classList.add('hidden');
    $('hintContent').textContent = q.hint;
    $('feedbackBox').classList.add('hidden');
    $('feedbackDiagnosis').classList.add('hidden');
    $('feedbackSteps').classList.add('hidden');
    $('btnMathContinue').classList.add('hidden');
    $('btnTryGuided').classList.add('hidden');
    $('btnShowHint').disabled = false;

    // Render 4 choices (ACT style A/B/C/D)
    const letters = ['A', 'B', 'C', 'D'];
    const grid = $('choicesGrid');
    grid.innerHTML = '';
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-letter">${letters[idx]}</span><span>${choice.text}</span>`;
      btn.addEventListener('click', () => submitAnswer(choice, btn));
      grid.appendChild(btn);
    });

    // Live ACT pacing timer
    $('mathTimer').textContent = '⏱ 0:00';
    mathSession.timerId = setInterval(() => {
      const sec = Math.floor((Date.now() - mathSession.startTime) / 1000);
      const m = Math.floor(sec / 60);
      const s = String(sec % 60).padStart(2, '0');
      $('mathTimer').textContent = `⏱ ${m}:${s}`;
    }, 500);
  }

  function submitAnswer(choice, clickedBtn) {
    if (!mathSession || mathSession.answered) return;
    mathSession.answered = true;
    if (mathSession.timerId) clearInterval(mathSession.timerId);

    const elapsed = Date.now() - mathSession.startTime;
    const q = mathSession.question;
    const evalRes = MathEngine.recordAnswer(q, choice, elapsed);

    // Highlight choices
    const allBtns = $('choicesGrid').querySelectorAll('.choice-btn');
    allBtns.forEach((btn, i) => {
      btn.disabled = true;
      const ch = q.choices[i];
      if (ch.isCorrect) btn.classList.add('correct');
      else if (btn === clickedBtn) btn.classList.add('wrong');
    });

    const fb = $('feedbackBox');
    fb.classList.remove('hidden', 'ok', 'err');

    if (evalRes.isCorrect) {
      AudioFX.playCorrect();
      mathSession.sprintCorrect += 1;
      fb.classList.add('ok');
      $('feedbackIcon').textContent = '✅';
      $('feedbackTitle').textContent = mathSession.sprintTotal > 1
        ? `Correct! (${mathSession.sprintStep}/${mathSession.sprintTotal})`
        : 'Awesome! Problem Solved!';

      let bodyMsg = `Solved in ${(elapsed / 1000).toFixed(1)}s. `;
      if (evalRes.tierChanged === 1) {
        bodyMsg += `⚡ Mastery rising! ${q.domainName} stepped UP to Tier ${MathEngine.getProfile().domains[q.domain].tier}!`;
      } else {
        bodyMsg += `Keep your streak going for bigger Gem bonuses!`;
      }
      $('feedbackBody').textContent = bodyMsg;

      // Show clean steps summary
      $('feedbackSteps').classList.remove('hidden');
      $('feedbackSteps').innerHTML = `<strong>Quick Recap:</strong><ol>${q.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;

      // Handle Mob / Boss Combat Strikes OR standard reward collection!
      if (mathSession.targetMob) {
        const mob = mathSession.targetMob;
        const defeated = Mobs.damageMob(mob, 1);
        Engine.spawnBreakParticles(mob.x - 0.5, mob.y + 0.8, mob.z - 0.5, mob.def.colorHex || '#c084fc');
        if (defeated) {
          AudioFX.playBossDefeat();
          $('feedbackTitle').textContent = mob.def.isBoss
            ? '🏆 VICTORY! You Defeated the ACT Math Titan!'
            : `⚔️ ${mob.def.name} Defeated!`;
          grantChallengeRewards();
          $('btnMathContinue').textContent = 'Collect Victory Loot →';
        } else {
          AudioFX.playBossHit();
          state.gems += 15;
          addXp(20);
          $('feedbackTitle').textContent = `💥 Direct Hit! ${mob.def.name} has ${mob.hp}/${mob.maxHp} HP left!`;
          $('btnMathContinue').textContent = `⚔️ Strike Again (${mob.hp} HP Left) →`;
          mathSession.retryOnContinue = true;
        }
      } else if (mathSession.sprintStep >= mathSession.sprintTotal) {
        grantChallengeRewards();
        $('btnMathContinue').textContent = mathSession.targetBlock ? 'Collect Rewards & Shatter Block →' : 'Collect Rewards & Continue →';
      } else {
        $('btnMathContinue').textContent = `Next Sprint Question (${mathSession.sprintStep + 1}/${mathSession.sprintTotal}) →`;
      }
      $('btnMathContinue').classList.remove('hidden');
    } else {
      AudioFX.playWrong();
      fb.classList.add('err');
      $('feedbackIcon').textContent = '🧭';
      $('feedbackTitle').textContent = 'Not quite — here is what tripped you up!';

      let bodyMsg = `No worries! Making mistakes is how MathCraft pinpoints what to strengthen.`;
      if (evalRes.tierChanged === -1) {
        bodyMsg += ` Difficulty automatically eased to Tier ${MathEngine.getProfile().domains[q.domain].tier} so we can build solid momentum.`;
      }
      $('feedbackBody').textContent = bodyMsg;

      // Specific Misconception Diagnosis!
      $('feedbackDiagnosis').classList.remove('hidden');
      const lesson = MathEngine.LESSONS[evalRes.detectedGapId] || MathEngine.LESSONS[q.lessonId];
      $('feedbackDiagnosis').innerHTML = `<strong>🔍 Gap Detected (${lesson ? lesson.title : q.domainName}):</strong> ${evalRes.diagnosisText}`;

      // Full worked steps
      $('feedbackSteps').classList.remove('hidden');
      $('feedbackSteps').innerHTML = `<strong>How to solve it step by step:</strong><ol>${q.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;

      // Offer direct "Fix This Skill Now" interactive basics lesson!
      const gapLessonId = evalRes.detectedGapId || q.lessonId;
      $('btnTryGuided').classList.remove('hidden');
      $('btnTryGuided').onclick = () => openLesson(gapLessonId);

      // Allow continuing sprint or trying another fresh problem
      $('btnMathContinue').classList.remove('hidden');
      if (mathSession.sprintStep < mathSession.sprintTotal) {
        $('btnMathContinue').textContent = `Continue Sprint (${mathSession.sprintStep + 1}/${mathSession.sprintTotal}) →`;
      } else {
        $('btnMathContinue').textContent = 'Try a Fresh Question →';
        mathSession.retryOnContinue = true;
      }
    }

    refreshAllUI();
  }

  function grantChallengeRewards() {
    const prof = MathEngine.getProfile();
    const pick = PICKAXES[state.pickaxeTier - 1] || PICKAXES[0];
    const streakBonus = 1 + Math.min(1.0, prof.streak * 0.12);
    const perkMult = (state.perks.gem_magnet ? 1.3 : 1.0) * (state.perks.champion_crown ? 1.25 : 1.0);

    // For sprints, scale reward by how many of 3 were solved
    const sprintRatio = mathSession.sprintTotal > 1 ? (mathSession.sprintCorrect / mathSession.sprintTotal) : 1;
    const gemsEarned = Math.max(10, Math.round((mathSession.baseGems || 25) * pick.gemMult * streakBonus * perkMult * sprintRatio));
    const xpEarned = Math.max(15, Math.round((mathSession.baseXp || 30) * perkMult * sprintRatio));

    state.gems += gemsEarned;
    addXp(xpEarned);

    const dropNotes = [`+${gemsEarned} 💎`, `+${xpEarned} XP`];
    if (mathSession.materialDrop && sprintRatio >= 0.66) {
      Object.entries(mathSession.materialDrop).forEach(([mat, qty]) => {
        state.materials[mat] = (state.materials[mat] || 0) + qty;
        dropNotes.push(`+${qty} ${mat}`);
      });
    }

    // Break the 3D world block or finalize Mob/Boss defeat!
    if (mathSession.targetMob) {
      const mob = mathSession.targetMob;
      state.stats.mobsDefeated = (state.stats.mobsDefeated || 0) + 1;
      if (mob.def.isBoss) {
        state.stats.bossesDefeated = (state.stats.bossesDefeated || 0) + 1;
        if (!state.perks.champion_crown) {
          state.perks.champion_crown = true;
          showToast('👑 UNLOCKED: ACT Champion Crown (+25% Permanent Gems)!', 'purple');
        }
      }
    } else if (mathSession.targetBlock) {
      const tb = mathSession.targetBlock;
      const info = INFO[tb.id];
      World.setBlock(tb.x, tb.y, tb.z, B.AIR, true);
      Engine.spawnBreakParticles(tb.x, tb.y, tb.z, (info && info.color) || '#4ade80');
      if (mathSession.isShrine) state.stats.shrinesDone += 1;
      else if (mathSession.isChest) state.stats.chestsOpened += 1;
      else state.stats.oresMined += 1;
    }

    showToast(`🎉 Rewards Collected: ${dropNotes.join(' • ')}`, 'gold');
    refreshAllUI();
  }

  // ==================== INTERACTIVE BASICS LESSON MODAL ====================
  function openLesson(lessonId) {
    const lesson = MathEngine.LESSONS[lessonId] || Object.values(MathEngine.LESSONS)[0];
    if (mathSession && mathSession.timerId) clearInterval(mathSession.timerId);

    lessonSession = {
      lessonId: lesson.id,
      revealedSteps: 1,
      checkAnswered: false
    };

    const dom = MathEngine.DOMAINS[lesson.domain];
    $('lessonDomainTag').textContent = dom ? dom.name : 'ACT Basics';
    $('lessonTitle').textContent = lesson.title;
    $('lessonConcept').textContent = lesson.summary;
    $('lessonFormula').textContent = lesson.formula;
    $('lessonActTip').textContent = lesson.actTip;
    $('lessonExampleProblem').textContent = `Example: ${lesson.exampleProblem}`;

    renderLessonSteps();

    // Render Quick Foundation Check
    $('checkPrompt').textContent = lesson.check.prompt;
    $('checkResult').classList.add('hidden');
    const cWrap = $('checkChoices');
    cWrap.innerHTML = '';
    lesson.check.choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'mc-btn';
      btn.textContent = ch;
      btn.addEventListener('click', () => {
        if (lessonSession.checkAnswered) return;
        lessonSession.checkAnswered = true;
        cWrap.querySelectorAll('button').forEach(b => { b.disabled = true; });
        const ok = (ch === lesson.check.answer);
        const resEl = $('checkResult');
        resEl.classList.remove('hidden');
        if (ok) {
          AudioFX.playCorrect();
          MathEngine.markLessonCompleted(lesson.id);
          state.gems += 15;
          addXp(20);
          resEl.style.color = '#4ade80';
          resEl.textContent = `✅ Nailed it! ${lesson.check.explanation} (+15 💎 Learning Bonus!)`;
          btn.classList.add('primary');
          refreshAllUI();
        } else {
          AudioFX.playWrong();
          resEl.style.color = '#fbbf24';
          resEl.textContent = `💡 Close! The answer is ${lesson.check.answer}. ${lesson.check.explanation}`;
          btn.classList.add('danger');
        }
      });
      cWrap.appendChild(btn);
    });

    $('btnLessonPracticeMore').onclick = () => {
      const domId = lesson.domain;
      openMathChallenge({
        targetBlock: null,
        sourceName: `🛠️ Guided Drill: ${dom.short}`,
        domain: domId,
        forcedTier: 1, // Gentle start to rebuild confidence!
        baseGems: 22,
        baseXp: 28,
        materialDrop: { iron: 1 }
      });
    };

    setModal('lesson');
  }

  function renderLessonSteps() {
    if (!lessonSession) return;
    const lesson = MathEngine.LESSONS[lessonSession.lessonId];
    const list = $('lessonStepsList');
    list.innerHTML = '';
    for (let i = 0; i < Math.min(lessonSession.revealedSteps, lesson.steps.length); i++) {
      const div = document.createElement('div');
      div.className = 'lesson-step-item';
      div.textContent = lesson.steps[i];
      list.appendChild(div);
    }
    const nextBtn = $('btnNextStep');
    if (lessonSession.revealedSteps >= lesson.steps.length) {
      nextBtn.disabled = true;
      nextBtn.textContent = 'All Steps Shown ✓';
    } else {
      nextBtn.disabled = false;
      nextBtn.textContent = `Reveal Step ${lessonSession.revealedSteps + 1} of ${lesson.steps.length} →`;
    }
  }

  // ==================== CRAFTING MODAL ====================
  function canAfford(cost) {
    if (!cost) return false;
    if (cost.gems && state.gems < cost.gems) return false;
    for (const [k, v] of Object.entries(cost)) {
      if (k === 'gems') continue;
      if ((state.materials[k] || 0) < v) return false;
    }
    return true;
  }

  function spendCost(cost) {
    if (cost.gems) state.gems -= cost.gems;
    for (const [k, v] of Object.entries(cost)) {
      if (k === 'gems') continue;
      state.materials[k] = (state.materials[k] || 0) - v;
    }
  }

  function formatCost(cost) {
    const icons = { gems: '💎', wood: '🪵', stone: '🪨', iron: '🔩', gold: '🥇', diamond: '💠' };
    return Object.entries(cost).map(([k, v]) => `${v} ${icons[k] || k}`).join('  +  ');
  }

  function openCrafting() {
    renderCrafting();
    setModal('craft');
  }

  function renderCrafting() {
    $('craftGems').textContent = state.gems;
    $('craftWood').textContent = state.materials.wood || 0;
    $('craftStone').textContent = state.materials.stone || 0;
    $('craftIron').textContent = state.materials.iron || 0;
    $('craftGold').textContent = state.materials.gold || 0;
    $('craftDiamond').textContent = state.materials.diamond || 0;

    document.querySelectorAll('.craft-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === currentCraftTab);
    });

    const list = $('craftList');
    list.innerHTML = '';

    if (currentCraftTab === 'pickaxes') {
      PICKAXES.forEach(p => {
        const owned = state.pickaxeTier >= p.tier;
        const isNext = p.tier === state.pickaxeTier + 1;
        const card = document.createElement('div');
        card.className = `craft-card ${owned ? 'owned' : ''}`;
        card.innerHTML = `
          <div>
            <div class="craft-card-head">
              <span class="craft-card-title" style="color:${p.color}">⛏️ ${p.name}</span>
              <span class="badge-lvl">${owned ? 'OWNED' : `TIER ${p.tier}`}</span>
            </div>
            <p class="craft-card-desc">${p.desc}</p>
          </div>
          <div>
            ${p.cost ? `<div class="craft-cost" style="margin-bottom:8px">Cost: ${formatCost(p.cost)}</div>` : ''}
            <button class="mc-btn ${owned ? '' : 'primary'}" style="width:100%" ${owned || !isNext || !canAfford(p.cost) ? 'disabled' : ''}>
              ${owned ? 'Equipped / Unlocked ✓' : (!isNext ? `Unlock Tier ${p.tier - 1} First` : 'Craft Upgrade')}
            </button>
          </div>
        `;
        const btn = card.querySelector('button');
        btn.addEventListener('click', () => {
          if (!isNext || !canAfford(p.cost)) return;
          spendCost(p.cost);
          state.pickaxeTier = p.tier;
          applyPerksToEngine();
          AudioFX.playCraft();
          showToast(`⛏️ Crafted ${p.name}! Deeper Math Ores unlocked!`, 'gold');
          refreshAllUI();
          renderCrafting();
        });
        list.appendChild(card);
      });
    } else if (currentCraftTab === 'perks') {
      PERKS.forEach(perk => {
        const owned = !perk.repeatable && !!state.perks[perk.id];
        const card = document.createElement('div');
        card.className = `craft-card ${owned ? 'owned' : ''}`;
        card.innerHTML = `
          <div>
            <div class="craft-card-head">
              <span class="craft-card-title">${perk.icon} ${perk.name}</span>
              ${owned ? '<span class="badge-lvl">ACTIVE</span>' : ''}
            </div>
            <p class="craft-card-desc">${perk.desc}</p>
          </div>
          <div>
            <div class="craft-cost" style="margin-bottom:8px">Cost: ${formatCost(perk.cost)}</div>
            <button class="mc-btn ${owned ? '' : 'primary'}" style="width:100%" ${owned || !canAfford(perk.cost) ? 'disabled' : ''}>
              ${owned ? 'Active ✓' : (perk.repeatable ? 'Activate Now' : 'Craft Perk')}
            </button>
          </div>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (owned || !canAfford(perk.cost)) return;
          spendCost(perk.cost);
          AudioFX.playCraft();
          if (perk.id === 'summon_ore') {
            for (let i = 0; i < 3; i++) {
              World.spawnFocusOreNear(Engine.player.x, Engine.player.z);
            }
            showToast('💚 3 Emerald Focus Ores spawned nearby!', 'purple');
            setModal(null);
          } else if (perk.id === 'summon_boss') {
            Mobs.respawnBossNow();
            showToast('👑 The ACT Math Titan has returned to the north Boss Arena!', 'purple');
            setModal(null);
          } else {
            state.perks[perk.id] = true;
            applyPerksToEngine();
            showToast(`✨ Unlocked ${perk.name}!`, 'gold');
          }
          refreshAllUI();
          if (activeModal === 'craft') renderCrafting();
        });
        list.appendChild(card);
      });
    } else {
      BLOCK_RECIPES.forEach(rec => {
        const info = INFO[rec.blockId];
        const card = document.createElement('div');
        card.className = 'craft-card';
        card.innerHTML = `
          <div>
            <div class="craft-card-head">
              <span class="craft-card-title">🧱 ${info.name} (×${rec.amount})</span>
            </div>
            <p class="craft-card-desc">${rec.desc}</p>
          </div>
          <div>
            <div class="craft-cost" style="margin-bottom:8px">Cost: ${formatCost(rec.cost)}</div>
            <button class="mc-btn primary" style="width:100%" ${!canAfford(rec.cost) ? 'disabled' : ''}>
              Craft ×${rec.amount}
            </button>
          </div>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (!canAfford(rec.cost)) return;
          spendCost(rec.cost);
          addHotbarBlock(rec.blockId, rec.amount);
          AudioFX.playCraft();
          showToast(`🧱 Crafted ${rec.amount}× ${info.name}!`);
          refreshAllUI();
          renderCrafting();
        });
        list.appendChild(card);
      });
    }
  }

  // ==================== ACT MASTERY & DIAGNOSTIC JOURNAL ====================
  function openJournal() {
    const prof = MathEngine.getProfile();
    const actScore = MathEngine.getEstimatedActScore();

    $('jActScore').textContent = `${actScore} / 36`;
    $('jActRank').textContent = MathEngine.getActRank(actScore);

    const acc = prof.totalSolved > 0 ? Math.round((prof.totalCorrect / prof.totalSolved) * 100) : null;
    $('jAccuracy').textContent = acc !== null ? `${acc}%` : '—';
    $('jTotalSolved').textContent = `${prof.totalCorrect} / ${prof.totalSolved} correct`;

    if (prof.totalSolved > 0) {
      const avgSec = Math.round(prof.totalTimeMs / prof.totalSolved / 1000);
      $('jPace').textContent = `${avgSec}s`;
      $('jPaceStatus').textContent = avgSec <= 45 ? 'ACT Pace: Fast ⚡' : (avgSec <= 65 ? 'On ACT Target ✓' : 'Practice for Speed');
    } else {
      $('jPace').textContent = '—';
      $('jPaceStatus').textContent = 'Mine an ore to measure';
    }
    $('jBestStreak').textContent = `${prof.bestStreak} 🔥`;

    // Render Detected Gaps
    const gaps = MathEngine.getTopGaps(5);
    const gapsEl = $('gapsList');
    gapsEl.innerHTML = '';
    if (gaps.length === 0) {
      gapsEl.innerHTML = `
        <div class="domain-row">
          <div class="domain-row-name" style="color:#4ade80">✨ No active stuck points right now!</div>
          <p class="small-muted" style="margin:6px 0 0">Keep mining Math Ores and Shrines—whenever you miss a question, MathCraft will automatically detect the exact concept and build a personalized mini-lesson right here.</p>
        </div>
      `;
    } else {
      gaps.forEach(g => {
        const card = document.createElement('div');
        card.className = 'gap-card';
        card.innerHTML = `
          <div class="gap-card-top">
            <span class="gap-card-name">⚠️ ${g.lesson.title}</span>
            <span class="gap-misses">${g.misses} miss${g.misses > 1 ? 'es' : ''}</span>
          </div>
          <div class="gap-card-desc">${g.lesson.summary}</div>
          <div class="gap-card-actions">
            <button class="mc-btn tiny accent btn-learn">📖 Learn Basics & Steps</button>
            <button class="mc-btn tiny primary btn-drill">⛏️ Practice Now</button>
          </div>
        `;
        card.querySelector('.btn-learn').addEventListener('click', () => openLesson(g.gapId));
        card.querySelector('.btn-drill').addEventListener('click', () => {
          openMathChallenge({
            targetBlock: null,
            sourceName: `🎯 Fixing Gap: ${g.lesson.title}`,
            domain: g.lesson.domain,
            baseGems: 26,
            baseXp: 35
          });
        });
        gapsEl.appendChild(card);
      });
    }

    // Render Advanced ACT Topics (Logs, Complex, Matrices, Conics, Sequences)
    const advEl = $('advancedTopicsList');
    if (advEl) {
      const advTopics = [
        { id: 'logarithms', label: 'Logarithms (log_b x)' },
        { id: 'complex_numbers', label: 'Complex Numbers (i)' },
        { id: 'matrices', label: 'Matrices & 2×2 Determinants' },
        { id: 'conic_sections', label: 'Conic Sections (Circles & Parabolas)' },
        { id: 'sequences_series', label: 'Arithmetic & Geometric Sequences' }
      ];
      advEl.innerHTML = '';
      advTopics.forEach(t => {
        const row = document.createElement('div');
        row.className = 'adv-topic-card';
        row.innerHTML = `
          <span class="adv-topic-name">🚀 ${t.label}</span>
          <div class="adv-topic-btns">
            <button class="mc-btn tiny primary btn-adv-drill">▶ Drill</button>
            <button class="mc-btn tiny btn-adv-basics">📖 Basics</button>
          </div>
        `;
        row.querySelector('.btn-adv-drill').addEventListener('click', () => {
          openMathChallenge({
            targetBlock: null,
            topicId: t.id,
            sourceName: `🚀 ${t.label}`,
            baseGems: 38,
            baseXp: 45
          });
        });
        row.querySelector('.btn-adv-basics').addEventListener('click', () => openLesson(t.id));
        advEl.appendChild(row);
      });
    }

    // Render 6 ACT Domains
    const domEl = $('domainsList');
    domEl.innerHTML = '';
    Object.values(MathEngine.DOMAINS).forEach(dom => {
      const st = prof.domains[dom.id];
      const row = document.createElement('div');
      row.className = 'domain-row';
      row.innerHTML = `
        <div class="domain-row-top">
          <span class="domain-row-name">${dom.name}</span>
          <span class="domain-row-meta">Tier ${st.tier}/5 • ${st.mastery}% Mastery (${st.correct}/${st.solved})</span>
        </div>
        <div class="mastery-bar">
          <div class="mastery-bar-fill" style="width:${st.mastery}%"></div>
        </div>
        <div class="domain-row-actions">
          <button class="mc-btn tiny primary btn-practice">▶ Practice (Tier ${st.tier})</button>
          <button class="mc-btn tiny btn-basics">📖 Basics Guide</button>
        </div>
      `;
      row.querySelector('.btn-practice').addEventListener('click', () => {
        openMathChallenge({
          targetBlock: null,
          sourceName: `📘 ${dom.short} Drill`,
          domain: dom.id,
          baseGems: 24,
          baseXp: 30
        });
      });
      row.querySelector('.btn-basics').addEventListener('click', () => openLesson(dom.defaultGap));
      domEl.appendChild(row);
    });

    setModal('journal');
  }

  // ==================== TIMED 12-QUESTION MINI-ACT EXAM ====================
  function openExamModal() {
    if (examSession && examSession.timerId) clearInterval(examSession.timerId);
    examSession = null;
    $('examIntroView').classList.remove('hidden');
    $('examActiveView').classList.add('hidden');
    $('examReportView').classList.add('hidden');
    $('examCountdown').textContent = '⏱ 12:00';
    $('examCountdown').className = 'exam-clock';
    setModal('exam');
  }

  function startTimedExam() {
    AudioFX.playOpenChallenge();
    const questions = MathEngine.generateMiniActExam();
    examSession = {
      questions,
      answers: new Array(questions.length).fill(null),
      currentIdx: 0,
      durationSec: 12 * 60,
      remainingSec: 12 * 60,
      startedAt: Date.now(),
      timerId: null
    };

    $('examIntroView').classList.add('hidden');
    $('examReportView').classList.add('hidden');
    $('examActiveView').classList.remove('hidden');

    renderExamQuestion();
    updateExamClock();
    examSession.timerId = setInterval(() => {
      if (!examSession) return;
      examSession.remainingSec -= 1;
      updateExamClock();
      if (examSession.remainingSec <= 0) {
        finishAndGradeExam();
      }
    }, 1000);
  }

  function updateExamClock() {
    if (!examSession) return;
    const rem = Math.max(0, examSession.remainingSec);
    const m = Math.floor(rem / 60);
    const s = String(rem % 60).padStart(2, '0');
    const el = $('examCountdown');
    el.textContent = `⏱ ${m}:${s}`;
    el.className = 'exam-clock' + (rem <= 45 ? ' urgent' : (rem <= 120 ? ' warn' : ''));
  }

  function renderExamQuestion() {
    if (!examSession) return;
    const idx = examSession.currentIdx;
    const q = examSession.questions[idx];
    const total = examSession.questions.length;

    // Navigation pills
    const pills = $('examNavPills');
    pills.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const p = document.createElement('button');
      p.className = 'exam-pill' + (i === idx ? ' current' : '') + (examSession.answers[i] !== null ? ' answered' : '');
      p.textContent = i + 1;
      p.addEventListener('click', () => {
        examSession.currentIdx = i;
        renderExamQuestion();
      });
      pills.appendChild(p);
    }

    const ansCount = examSession.answers.filter(a => a !== null).length;
    $('examQNum').textContent = `Question ${idx + 1} of ${total}`;
    $('examQDomain').textContent = q.domainName;
    $('examQTier').textContent = `Tier ${q.tier || 3} • ${q.tierLabel}`;
    $('examAnsweredCount').textContent = `${ansCount} / ${total} Answered`;

    $('examQPrompt').textContent = q.prompt;
    if (q.diagram) {
      $('examQDiagram').innerHTML = q.diagram;
      $('examQDiagram').classList.remove('hidden');
    } else {
      $('examQDiagram').innerHTML = '';
      $('examQDiagram').classList.add('hidden');
    }

    const letters = ['A', 'B', 'C', 'D'];
    const grid = $('examChoicesGrid');
    grid.innerHTML = '';
    q.choices.forEach((choice, cIdx) => {
      const btn = document.createElement('button');
      const isSelected = examSession.answers[idx] === cIdx;
      btn.className = `choice-btn ${isSelected ? 'selected-exam' : ''}`;
      btn.innerHTML = `<span class="choice-letter">${letters[cIdx]}</span><span>${choice.text}</span>`;
      btn.addEventListener('click', () => {
        examSession.answers[idx] = cIdx;
        renderExamQuestion();
      });
      grid.appendChild(btn);
    });

    $('btnExamPrev').disabled = (idx === 0);
    $('btnExamNext').disabled = (idx === total - 1);
  }

  function finishAndGradeExam() {
    if (!examSession) return;
    if (examSession.timerId) clearInterval(examSession.timerId);
    const qs = examSession.questions;
    const ans = examSession.answers;
    const elapsedSec = Math.max(1, Math.round((Date.now() - examSession.startedAt) / 1000));
    const perQMs = Math.round((elapsedSec * 1000) / qs.length);

    let correctCount = 0;
    const reviewHtml = [];

    qs.forEach((q, i) => {
      const selIdx = ans[i];
      const chosen = selIdx !== null ? q.choices[selIdx] : { text: '(Skipped)', isCorrect: false, gapId: q.lessonId, whyWrong: 'Question was left blank—on the real ACT, NEVER leave a question blank because there is no guessing penalty!' };
      const correctChoice = q.choices.find(c => c.isCorrect);
      const evalRes = MathEngine.recordAnswer(q, chosen, perQMs);
      if (chosen.isCorrect) correctCount += 1;

      const gapId = evalRes.detectedGapId || q.lessonId;
      reviewHtml.push({
        num: i + 1,
        ok: chosen.isCorrect,
        prompt: q.prompt,
        chosenText: chosen.text,
        correctText: correctChoice ? correctChoice.text : '',
        whyWrong: chosen.isCorrect ? '' : (evalRes.diagnosisText || ''),
        gapId
      });
    });

    const scaled = MathEngine.scaleMiniExamScore(correctCount, qs.length);
    const pct = Math.round((correctCount / qs.length) * 100);
    const m = Math.floor(elapsedSec / 60);
    const s = String(elapsedSec % 60).padStart(2, '0');
    const avgSec = Math.round(elapsedSec / qs.length);

    // Grant Mini-ACT Exam Treasure Vault Rewards!
    const gemsEarned = 80 + Math.round((correctCount / qs.length) * 320);
    const xpEarned = 100 + correctCount * 28;
    const diamEarned = correctCount >= 9 ? 5 : (correctCount >= 6 ? 3 : 1);
    const goldEarned = correctCount >= 8 ? 5 : 2;

    state.gems += gemsEarned;
    state.materials.diamond = (state.materials.diamond || 0) + diamEarned;
    state.materials.gold = (state.materials.gold || 0) + goldEarned;
    state.stats.examsDone = (state.stats.examsDone || 0) + 1;
    if (scaled > (state.stats.bestExamScore || 0)) state.stats.bestExamScore = scaled;
    addXp(xpEarned);

    AudioFX.playBossDefeat();
    $('examActiveView').classList.add('hidden');
    $('examReportView').classList.remove('hidden');

    $('repScaledScore').textContent = `${scaled} / 36`;
    $('repRank').textContent = MathEngine.getActRank(scaled);
    $('repRawScore').textContent = `${correctCount} / ${qs.length}`;
    $('repPct').textContent = `${pct}% Correct`;
    $('repTime').textContent = `${m}:${s}`;
    $('repPace').textContent = `Avg ${avgSec}s / question`;
    $('repGems').textContent = `+${gemsEarned} 💎`;
    $('repLoot').textContent = `+${diamEarned} Diamonds • +${goldEarned} Gold`;

    const revEl = $('examReviewList');
    revEl.innerHTML = '';
    reviewHtml.forEach(item => {
      const div = document.createElement('div');
      div.className = `exam-rev-item ${item.ok ? '' : 'wrong'}`;
      div.innerHTML = `
        <div class="exam-rev-top">
          <span>${item.ok ? '✅' : '❌'} Q${item.num}: ${item.prompt}</span>
          ${!item.ok ? `<button class="mc-btn tiny accent btn-rev-study">📖 Study Basics</button>` : ''}
        </div>
        <div style="color:#cbd5e1">
          Your answer: <b>${item.chosenText}</b> ${item.ok ? '' : `• Correct: <b style="color:#4ade80">${item.correctText}</b>`}
        </div>
        ${!item.ok ? `<div style="color:#e9d5ff;margin-top:4px">🔍 ${item.whyWrong}</div>` : ''}
      `;
      const sBtn = div.querySelector('.btn-rev-study');
      if (sBtn) sBtn.addEventListener('click', () => openLesson(item.gapId));
      revEl.appendChild(div);
    });

    examSession = null;
    refreshAllUI();
  }

  // ==================== FLOATING 3D MOB LABELS & BOSS BAR ====================
  const labelPool = new Map();
  function updateFrameHud(proj, view, sw, sh) {
    if (!Mobs || activeModal !== null) return;
    const layer = $('mobLabelsLayer');
    let bossNear = null;

    Mobs.list.forEach(m => {
      let tag = labelPool.get(m.id);
      const dist = Math.hypot(Engine.player.x - m.x, Engine.player.z - m.z);

      if (m.def.isBoss && m.alive && dist < 24) {
        bossNear = m;
      }

      if (!m.alive || dist > 20) {
        if (tag) tag.style.display = 'none';
        return;
      }

      const pt = Engine.projectToScreen(m.x, m.y + m.def.height + 0.35, m.z, proj, view, sw, sh);
      if (!pt) {
        if (tag) tag.style.display = 'none';
        return;
      }

      if (!tag) {
        tag = document.createElement('div');
        tag.className = `mob-tag ${m.def.isBoss ? 'boss' : ''}`;
        layer.appendChild(tag);
        labelPool.set(m.id, tag);
      }
      tag.style.display = 'flex';
      tag.style.left = `${Math.round(pt.x)}px`;
      tag.style.top = `${Math.round(pt.y)}px`;
      const hpPct = Math.round((m.hp / m.maxHp) * 100);
      tag.innerHTML = `<span>${m.def.name}</span><div class="mob-hp-bar"><div class="mob-hp-fill" style="width:${hpPct}%"></div></div>`;
    });

    const bossWrap = $('bossBarWrap');
    if (bossNear) {
      bossWrap.classList.remove('hidden');
      $('bossHpText').textContent = `${bossNear.hp} / ${bossNear.maxHp} HP`;
      $('bossBarFill').style.width = `${Math.round((bossNear.hp / bossNear.maxHp) * 100)}%`;
    } else {
      bossWrap.classList.add('hidden');
    }
  }

  // ==================== WIRE BUTTONS & SHORTCUTS ====================
  function bindEvents() {
    $('btnPlay').addEventListener('click', () => {
      gameStarted = true;
      setModal(null);
      refreshAllUI();
      Engine.requestLock();
      showToast('⛏️ Look ahead! Mine the glowing Math Ores to earn Gems & raise your ACT score!');
    });

    $('btnQuickPractice').addEventListener('click', () => {
      gameStarted = true;
      refreshAllUI();
      openJournal();
    });

    $('btnResetSave').addEventListener('click', resetAllProgress);

    $('btnCraft').addEventListener('click', openCrafting);
    $('btnCloseCraft').addEventListener('click', () => setModal(null));
    document.querySelectorAll('.craft-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentCraftTab = tab.dataset.tab;
        renderCrafting();
      });
    });

    $('btnJournal').addEventListener('click', openJournal);
    $('btnCloseJournal').addEventListener('click', () => setModal(null));

    $('btnExam').addEventListener('click', openExamModal);
    $('btnCloseExam').addEventListener('click', () => {
      if (examSession && examSession.timerId) clearInterval(examSession.timerId);
      examSession = null;
      setModal(null);
    });
    $('btnCancelExamIntro').addEventListener('click', () => setModal(null));
    $('btnStartExamNow').addEventListener('click', startTimedExam);
    $('btnExamPrev').addEventListener('click', () => {
      if (examSession && examSession.currentIdx > 0) {
        examSession.currentIdx -= 1;
        renderExamQuestion();
      }
    });
    $('btnExamNext').addEventListener('click', () => {
      if (examSession && examSession.currentIdx < examSession.questions.length - 1) {
        examSession.currentIdx += 1;
        renderExamQuestion();
      }
    });
    $('btnSubmitExam').addEventListener('click', finishAndGradeExam);
    $('btnRetakeExam').addEventListener('click', startTimedExam);
    $('btnExamFinishClose').addEventListener('click', () => setModal(null));

    $('btnSound').addEventListener('click', () => {
      const m = AudioFX.toggleMute();
      $('btnSound').textContent = m ? '🔇' : '🔊';
    });

    $('btnTouchMode').addEventListener('click', () => {
      touchMode = !touchMode;
      $('btnTouchMode').classList.toggle('primary', touchMode);
      $('touchControls').classList.toggle('hidden', !(touchMode && activeModal === null && gameStarted));
      showToast(touchMode ? '📱 Touch Controls ON (iPhone / Mobile Mode)' : '🖥️ Touch Controls OFF (Keyboard & Mouse)');
    });
    $('btnTouchMode').classList.toggle('primary', touchMode);

    // Virtual Joystick & Touch Action Buttons
    setupTouchControls();

    $('btnHelp').addEventListener('click', () => {
      $('btnPlay').textContent = '▶ Resume World';
      $('btnResetSave').style.display = 'inline-block';
      setModal('title');
    });

    // Math modal buttons
    $('btnShowHint').addEventListener('click', () => {
      $('hintBox').classList.remove('hidden');
      $('btnShowHint').disabled = true;
    });

    $('btnTeachBasics').addEventListener('click', () => {
      if (mathSession && mathSession.question) {
        openLesson(mathSession.question.lessonId);
      }
    });

    $('btnCloseMath').addEventListener('click', () => {
      if (mathSession && mathSession.timerId) clearInterval(mathSession.timerId);
      mathSession = null;
      setModal(null);
    });

    $('btnMathContinue').addEventListener('click', () => {
      if (!mathSession) return;
      if (mathSession.retryOnContinue) {
        mathSession.retryOnContinue = false;
        loadNextMathQuestion();
        return;
      }
      if (mathSession.sprintStep < mathSession.sprintTotal) {
        mathSession.sprintStep += 1;
        loadNextMathQuestion();
        return;
      }
      if (mathSession.timerId) clearInterval(mathSession.timerId);
      mathSession = null;
      setModal(null);
    });

    // Lesson modal buttons
    $('btnNextStep').addEventListener('click', () => {
      if (!lessonSession) return;
      lessonSession.revealedSteps += 1;
      renderLessonSteps();
    });
    $('btnCloseLesson').addEventListener('click', () => setModal(null));
    $('btnLessonDone').addEventListener('click', () => setModal(null));

    // Keyboard shortcuts (1-9 hotbar, C craft, M mastery journal)
    window.addEventListener('keydown', e => {
      if (!gameStarted) return;
      if (e.code.startsWith('Digit') && activeModal === null) {
        const n = parseInt(e.code.replace('Digit', ''), 10);
        if (n >= 1 && n <= 9) {
          state.selectedSlot = n - 1;
          renderHotbar();
        }
      } else if (e.code === 'KeyC' && (activeModal === null || activeModal === 'craft')) {
        if (activeModal === 'craft') setModal(null);
        else openCrafting();
      } else if (e.code === 'KeyM' && (activeModal === null || activeModal === 'journal')) {
        if (activeModal === 'journal') setModal(null);
        else openJournal();
      } else if (e.code === 'KeyT' && (activeModal === null || activeModal === 'exam')) {
        if (activeModal === 'exam') {
          if (examSession && examSession.timerId) clearInterval(examSession.timerId);
          examSession = null;
          setModal(null);
        } else {
          openExamModal();
        }
      }
    });

    window.addEventListener('wheel', e => {
      if (activeModal !== null || !gameStarted) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      state.selectedSlot = (state.selectedSlot + dir + 9) % 9;
      renderHotbar();
    });
  }

  function setupTouchControls() {
    const base = $('joyBase');
    const knob = $('joyKnob');
    if (!base || !knob) return;

    let joyTouchId = null;
    let joyMouseDown = false;
    const maxR = 42;

    function updateJoy(clientX, clientY) {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      Engine.setTouchMove(dx / maxR, dy / maxR, dist > maxR * 0.82);
    }

    function resetJoy() {
      joyTouchId = null;
      joyMouseDown = false;
      knob.style.transform = 'translate(0px, 0px)';
      Engine.setTouchMove(0, 0, false);
    }

    base.addEventListener('touchstart', e => {
      e.preventDefault();
      e.stopPropagation();
      if (joyTouchId === null && e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        joyTouchId = t.identifier;
        updateJoy(t.clientX, t.clientY);
      }
    }, { passive: false });

    // Track thumb movement on window so sliding past the circle edge stays buttery smooth on iPhone
    window.addEventListener('touchmove', e => {
      if (joyTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === joyTouchId) {
          e.preventDefault();
          updateJoy(t.clientX, t.clientY);
        }
      }
    }, { passive: false });

    const endJoyTouch = e => {
      if (joyTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joyTouchId) resetJoy();
      }
    };
    window.addEventListener('touchend', endJoyTouch, { passive: true });
    window.addEventListener('touchcancel', endJoyTouch, { passive: true });

    // Mouse fallback for testing joystick on desktop
    base.addEventListener('mousedown', e => {
      e.stopPropagation();
      joyMouseDown = true;
      updateJoy(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', e => {
      if (joyMouseDown) updateJoy(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => {
      if (joyMouseDown) resetJoy();
    });

    // Action Buttons (Mine/Attack, Place, Jump)
    const bindHoldBtn = (el, onDown, onUp) => {
      if (!el) return;
      el.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); onDown(); }, { passive: false });
      el.addEventListener('touchend', e => { e.preventDefault(); if (onUp) onUp(); }, { passive: false });
      el.addEventListener('touchcancel', () => { if (onUp) onUp(); });
      el.addEventListener('mousedown', e => { e.stopPropagation(); onDown(); });
      el.addEventListener('mouseup', () => { if (onUp) onUp(); });
      el.addEventListener('mouseleave', () => { if (onUp) onUp(); });
    };

    bindHoldBtn($('btnTouchMine'), () => Engine.triggerPrimaryAction());
    bindHoldBtn($('btnTouchPlace'), () => Engine.triggerSecondaryAction());
    bindHoldBtn($('btnTouchJump'), () => Engine.setTouchJump(true), () => Engine.setTouchJump(false));
  }

  // ==================== BOOT ====================
  function boot() {
    // Register offline Service Worker for iPhone PWA ("Add to Home Screen")
    if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
    const savedEdits = loadGame();
    if (localStorage.getItem(SAVE_KEY)) {
      $('btnPlay').textContent = '▶ Continue World';
      $('btnResetSave').style.display = 'inline-block';
    }

    World.generate(savedEdits);
    Mobs.initWorldMobs();
    Engine.init($('gameCanvas'), $('handCanvas'), {
      onMine: handleMine,
      onHitMob: handleHitMob,
      onPlace: handlePlace,
      onTargetChange: onTargetChange,
      onFrameHud: updateFrameHud,
      onEscape: () => {
        if (activeModal && activeModal !== 'title') {
          if (mathSession && mathSession.timerId) clearInterval(mathSession.timerId);
          if (examSession && examSession.timerId) clearInterval(examSession.timerId);
          examSession = null;
          setModal(null);
        }
      }
    });

    applyPerksToEngine();
    bindEvents();
    refreshAllUI();
    setModal('title');
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
