class BuzzerAudioEngine {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private muted = false;
  private currentFreq = 0;

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stop();
    }
  }

  updateFrequency(freqHz: number) {
    if (this.muted || freqHz <= 0) {
      this.stop();
      return;
    }

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    if (!this.osc || !this.gain) {
      this.osc = this.ctx.createOscillator();
      this.gain = this.ctx.createGain();
      this.osc.type = 'square';
      this.gain.gain.value = 0.045;
      this.osc.connect(this.gain);
      this.gain.connect(this.ctx.destination);
      this.osc.start();
    }

    if (Math.abs(this.currentFreq - freqHz) > 0.5) {
      this.currentFreq = freqHz;
      this.osc.frequency.setTargetAtTime(freqHz, this.ctx.currentTime, 0.01);
    }
  }

  stop() {
    this.currentFreq = 0;
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {
        // ignore
      }
      this.osc = null;
    }
    if (this.gain) {
      try {
        this.gain.disconnect();
      } catch {
        // ignore
      }
      this.gain = null;
    }
  }
}

export const buzzerAudio = new BuzzerAudioEngine();
