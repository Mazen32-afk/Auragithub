// Web Audio API synthesized notification sound for Android alerts
export function playLowStockAlertSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Android alert two-tone chime (F#5 -> C#6)
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(739.99, now); // F#5
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.12);

    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second higher tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1108.73, now + 0.14); // C#6
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.35);

    gain2.gain.setValueAtTime(0.2, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.48);

    // Vibration API if supported on real Android device
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 150]);
    }
  } catch {
    // AudioContext blocked or not allowed prior to interaction
  }
}
