// Web Audio API Ambient Sound Generator
// Synthesizes soothing organic sounds locally with zero external audio assets

export type SoundType = 'rain' | 'ocean' | 'wind' | 'stream';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentSound: SoundType = 'rain';
  private masterGain: GainNode | null = null;
  private volume: number = 0.4;
  private activeNodes: (AudioNode | number)[] = [];
  private waveInterval: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public play(type: SoundType = this.currentSound) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopCurrent();
    this.currentSound = type;
    this.isPlaying = true;

    if (type === 'rain') {
      this.generateRain();
    } else if (type === 'ocean') {
      this.generateOcean();
    } else if (type === 'wind') {
      this.generateWind();
    } else if (type === 'stream') {
      this.generateStream();
    }
  }

  public stop() {
    this.stopCurrent();
    this.isPlaying = false;
  }

  public toggle(type: SoundType): boolean {
    if (this.isPlaying && this.currentSound === type) {
      this.stop();
      return false;
    } else {
      this.play(type);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentSound(): SoundType {
    return this.currentSound;
  }

  private stopCurrent() {
    if (this.waveInterval) {
      window.clearInterval(this.waveInterval);
      this.waveInterval = null;
    }
    this.activeNodes.forEach(node => {
      if (typeof node === 'number') {
        window.clearTimeout(node);
      } else if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
        try {
          (node as AudioScheduledSourceNode).stop();
        } catch {}
      } else {
        try {
          node.disconnect();
        } catch {}
      }
    });
    this.activeNodes = [];
  }

  // Generates white/pink buffer
  private createNoiseBuffer(durationSeconds = 4): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, sampleRate * durationSeconds, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < sampleRate * durationSeconds; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filtering approximation
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
    }
    return buffer;
  }

  private generateRain() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, lowpass, rainGain);

    // Random gentle droplet sounds
    const dropletInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();

      const freq = 1200 + Math.random() * 800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, this.ctx.currentTime + 0.08);

      dropGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    }, 450);

    this.activeNodes.push(dropletInterval);
  }

  private generateOcean() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(6);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, filter, waveGain);

    // Ocean swell cycle: ~8 second rhythmic rise and fall
    const waveCycle = () => {
      if (!this.ctx || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      waveGain.gain.cancelScheduledValues(now);
      waveGain.gain.setValueAtTime(waveGain.gain.value, now);
      waveGain.gain.linearRampToValueAtTime(0.45, now + 4);
      waveGain.gain.linearRampToValueAtTime(0.08, now + 8);

      filter.frequency.linearRampToValueAtTime(650, now + 4);
      filter.frequency.linearRampToValueAtTime(260, now + 8);
    };

    waveCycle();
    this.waveInterval = window.setInterval(waveCycle, 8000);
  }

  private generateWind() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(6);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, bandpass, windGain);

    // Subtle natural modulation of wind whistling
    const windInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const targetFreq = 300 + Math.random() * 350;
      const targetGain = 0.15 + Math.random() * 0.25;
      bandpass.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 3);
      windGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 3);
    }, 3200);

    this.activeNodes.push(windInterval);
  }

  private generateStream() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(400, this.ctx.currentTime);

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1600, this.ctx.currentTime);

    const streamGain = this.ctx.createGain();
    streamGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

    noiseSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(streamGain);
    streamGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, highpass, lowpass, streamGain);
  }
}

export const soundSynth = new SoundSynthesizer();
