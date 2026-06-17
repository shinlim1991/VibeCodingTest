/**
 * Web Audio API synthesizer for retro-style game sound effects.
 * Lazily initialized on the first user interaction.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.error("Failed to initialize Web Audio API:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  private createOscillator(
    type: OscillatorType,
    freqStart: number,
    freqEnd: number,
    duration: number,
    gStart: number = 0.3,
    gEnd: number = 0.001
  ) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Resume context if suspended
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(gStart, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(gEnd, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Play normal spacebar feedback, pitch scales with combo count!
  playTap(chargePercentage: number) {
    // Pitch goes up as charging goes up to create urgency!
    const baseFreq = 180 + chargePercentage * 300; // 180Hz to 480Hz
    this.createOscillator("triangle", baseFreq, baseFreq * 1.5, 0.08, 0.15, 0.01);
  }

  // Play countdown beep
  playBeep(isGo: boolean = false) {
    const freq = isGo ? 880 : 440;
    const duration = isGo ? 0.3 : 0.15;
    this.createOscillator("sine", freq, freq, duration, 0.2, 0.001);
  }

  // Sound when laser charging reaches maximum or when hit milestone
  playChargeDing() {
    this.createOscillator("sine", 880, 1760, 0.25, 0.2, 0.001);
  }

  // Play laser fire sound (for victory animation)
  playLaser() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 1.2);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 1.2);
    osc2.stop(this.ctx.currentTime + 1.2);
  }

  // Play explosion sound when enemy is hit/defeated
  playExplosion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Create custom noise buffer for explosion
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 1.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    // Also add a low bass drop frequency
    const bass = this.ctx.createOscillator();
    bass.type = "sawtooth";
    bass.frequency.setValueAtTime(120, this.ctx.currentTime);
    bass.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 1.0);
    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
    bass.connect(bassGain);
    bassGain.connect(this.ctx.destination);

    noise.start();
    bass.start();
    noise.stop(this.ctx.currentTime + 1.5);
    bass.stop(this.ctx.currentTime + 1.5);
  }

  // Play fizzle sound for failed activation
  playFizzle() {
    this.createOscillator("sawtooth", 150, 40, 0.4, 0.3, 0.01);
  }

  // Play happy winning theme
  playVictoryJingle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C E G C E G C
    const currTime = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, currTime + timeOffset);
      gain.gain.setValueAtTime(0.15, currTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, currTime + timeOffset + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(currTime + timeOffset);
      osc.stop(currTime + timeOffset + 0.4);
    });
  }

  // Play sad losing theme
  playDefeatJingle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [311.13, 293.66, 277.18, 220.00]; // Eb, D, Db, A (sad descending)
    const currTime = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.22;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, currTime + timeOffset);
      gain.gain.setValueAtTime(0.15, currTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, currTime + timeOffset + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(currTime + timeOffset);
      osc.stop(currTime + timeOffset + 0.6);
    });
  }
}

export const sound = new SoundManager();
