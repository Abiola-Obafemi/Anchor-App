class SoundService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playStart() {
    this.playTone(440, 'sine', 0.5, 0.05);
    setTimeout(() => this.playTone(880, 'sine', 0.5, 0.05), 100);
  }

  playWarning() {
    this.playTone(220, 'triangle', 0.3, 0.1);
  }

  playSuccess() {
    this.playTone(523.25, 'sine', 0.8, 0.05); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.8, 0.05), 150); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.8, 0.05), 300); // G5
  }

  playFailure() {
    this.playTone(110, 'sawtooth', 0.5, 0.05);
  }
}

export const soundService = new SoundService();
