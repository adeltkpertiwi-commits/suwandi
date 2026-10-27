// Procedural Web Audio Engine for Math Air Force
// Guaranteed zero network latency, no missing asset 404s, fully responsive.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.5;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;

  constructor() {
    // Load persisted sound settings if available
    try {
      const savedMute = localStorage.getItem('math_air_force_muted');
      if (savedMute !== null) {
        this.soundEnabled = savedMute !== 'true';
      }
      const savedVol = localStorage.getItem('math_air_force_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
      }
    } catch {
      // LocalStorage unavailable fallback
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    try {
      localStorage.setItem('math_air_force_muted', (!this.soundEnabled).toString());
    } catch {
      // ignore
    }
    if (!this.soundEnabled) {
      this.stopEngine();
    }
    return this.soundEnabled;
  }

  public setSoundEnabled(val: boolean) {
    this.soundEnabled = val;
    try {
      localStorage.setItem('math_air_force_muted', (!val).toString());
    } catch {
      // ignore
    }
    if (!val) {
      this.stopEngine();
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('math_air_force_volume', this.volume.toString());
    } catch {
      // ignore
    }
  }

  // Laser shot sound
  public playLaser(isEnemy: boolean = false) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = isEnemy ? 'sawtooth' : 'triangle';
      if (isEnemy) {
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
      } else {
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
      }

      const baseVol = (isEnemy ? 0.12 : 0.2) * this.volume;
      gain.gain.setValueAtTime(baseVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isEnemy ? 0.12 : 0.1));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // ignore audio errors
    }
  }

  // Super laser when math target is destroyed
  public playPlasmaBlast() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.4);

      osc2.frequency.setValueAtTime(600, now);
      osc2.frequency.exponentialRampToValueAtTime(40, now + 0.4);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.42);
      osc2.stop(now + 0.42);
    } catch {
      // ignore
    }
  }

  // Explosion sound using filtered noise
  public playExplosion(isBoss: boolean = false) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = isBoss ? 0.7 : 0.28;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isBoss ? 800 : 500, now);
      filter.frequency.exponentialRampToValueAtTime(30, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime((isBoss ? 0.45 : 0.3) * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + duration + 0.05);
    } catch {
      // ignore
    }
  }

  // Powerup collect sound (arpeggio)
  public playPowerup() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25 * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.13);
    });
  }

  // Correct math answer: Triumphant Major Triad
  public playCorrect() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.08 },
      { f: 783.99, t: 0.16 },
      { f: 1046.5, t: 0.24 }
    ];
    const now = this.ctx.currentTime;

    chords.forEach(({ f, t }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + t;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);

      gain.gain.setValueAtTime(0.28 * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.38);
    });
  }

  // Wrong math answer: Low alert buzzer
  public playWrong() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(130, now + 0.25);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Boss warning siren
  public playBossAlert() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + i * 0.35;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, time);
      osc.frequency.linearRampToValueAtTime(640, time + 0.18);
      osc.frequency.linearRampToValueAtTime(320, time + 0.32);

      gain.gain.setValueAtTime(0.3 * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.33);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.34);
    }
  }

  // Victory Fanfare
  public playVictory() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.35 },
      { f: 587.33, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.6 }
    ];

    let offset = 0;
    const now = this.ctx.currentTime;

    melody.forEach(({ f, d }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + offset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, time);

      gain.gain.setValueAtTime(0.25 * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + d + 0.05);

      offset += d + 0.04;
    });
  }

  // UI Click
  public playClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  // Engine hum loop
  public startEngine() {
    if (!this.soundEnabled || this.engineOsc) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'triangle';
      this.engineOsc.frequency.setValueAtTime(85, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.04 * this.volume, this.ctx.currentTime);

      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
    } catch {
      // ignore
    }
  }

  public updateEnginePitch(speedRatio: number) {
    if (!this.engineOsc || !this.ctx) return;
    const targetFreq = 85 + speedRatio * 35;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // ignore
      }
      this.engineOsc = null;
      this.engineGain = null;
    }
  }
}

export const sound = new SoundEngine();
