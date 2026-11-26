// Synthesized Web Audio sound effects (zero external assets required)
window.MathCraft = window.MathCraft || {};

window.MathCraft.Audio = (function () {
  let ctx = null;
  let muted = false;

  function ensureCtx() {
    if (muted) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function tone(freq, duration, type, gainVal, delay = 0, slideTo = null) {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(gainVal, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function haptic(style) {
    try {
      // Native iOS SwiftUI WKWebView Taptic Engine bridge
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptics) {
        window.webkit.messageHandlers.haptics.postMessage(style || 'light');
      } else if (navigator.vibrate) {
        navigator.vibrate(style === 'heavy' ? 35 : (style === 'error' ? [25, 30, 25] : 12));
      }
    } catch (_) {}
  }

  return {
    haptic,
    isMuted: () => muted,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    playMine() {
      haptic('light');
      tone(190 + Math.random() * 50, 0.09, 'square', 0.08, 0, 95);
      tone(120, 0.07, 'triangle', 0.09, 0.01, 60);
    },
    playPlace() {
      haptic('light');
      tone(280, 0.07, 'triangle', 0.09, 0, 340);
    },
    playJump() {
      tone(180, 0.11, 'sine', 0.05, 0, 310);
    },
    playCorrect() {
      haptic('success');
      tone(523.25, 0.12, 'triangle', 0.12, 0);
      tone(659.25, 0.12, 'triangle', 0.12, 0.08);
      tone(783.99, 0.22, 'triangle', 0.14, 0.16);
    },
    playWrong() {
      haptic('error');
      tone(220, 0.16, 'sawtooth', 0.08, 0, 175);
      tone(165, 0.22, 'sawtooth', 0.08, 0.12, 130);
    },
    playLevelUp() {
      haptic('success');
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => tone(n, 0.24, 'triangle', 0.14, i * 0.09));
    },
    playCraft() {
      haptic('medium');
      tone(440, 0.08, 'square', 0.08, 0);
      tone(660, 0.14, 'triangle', 0.11, 0.07);
    },
    playOpenChallenge() {
      tone(392, 0.1, 'sine', 0.09, 0);
      tone(587.33, 0.16, 'sine', 0.1, 0.07);
    },
    playBossHit() {
      haptic('heavy');
      tone(140, 0.18, 'sawtooth', 0.14, 0, 55);
      tone(660, 0.14, 'square', 0.09, 0.03, 920);
    },
    playBossDefeat() {
      haptic('success');
      const notes = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((n, i) => tone(n, 0.28, 'triangle', 0.15, i * 0.08));
    }
  };
})();
