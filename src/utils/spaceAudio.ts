'use client';

class SpaceAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private isMuted: boolean = true;
  private isInitialized: boolean = false;

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);
    this.isInitialized = true;
  }

  public enableAudio(): boolean {
    this.initContext();
    if (!this.ctx || !this.ambientGain) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = false;
    this.startAmbientDrone();
    return true;
  }

  public disableAudio() {
    this.isMuted = true;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  public toggleMute(): boolean {
    if (this.isMuted) {
      this.enableAudio();
      return true;
    } else {
      this.disableAudio();
      return false;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private startAmbientDrone() {
    if (!this.ctx || !this.ambientGain || this.osc1) return;

    // Deep cosmic resonance filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.5, this.ctx.currentTime);
    filter.connect(this.ambientGain);

    // Primary low sub-oscillator (55 Hz - A1 note)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    // Detuned sub-oscillator (57.5 Hz) for gentle cosmic acoustic binaural beat
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(57.5, this.ctx.currentTime);

    this.osc1.connect(filter);
    this.osc2.connect(filter);

    this.osc1.start();
    this.osc2.start();

    // Fade in ambient volume smoothly
    this.ambientGain.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.4);
  }

  public playTelemetryBeep(frequency: number = 880, duration: number = 0.08) {
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy catch
    }
  }

  public playDeepSpacePulse() {
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy catch
    }
  }
}

export const spaceAudio = new SpaceAudioEngine();
