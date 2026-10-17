// Mic -> 16 kHz mono 16-bit PCM chunks (~100 ms). Box-average downsample from the context rate.
class GuardProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.pos = 0;
    this.sum = 0;
    this.cnt = 0;
    this.out = new Int16Array(1600);
    this.n = 0;
  }
  process(inputs) {
    const ch = inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      this.sum += ch[i];
      this.cnt++;
      this.pos++;
      if (this.pos < this.ratio) continue;
      this.pos -= this.ratio;
      const s = Math.max(-1, Math.min(1, this.sum / this.cnt));
      this.sum = 0;
      this.cnt = 0;
      this.out[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.n === this.out.length) {
        this.port.postMessage(this.out.slice().buffer);
        this.n = 0;
      }
    }
    return true;
  }
}
registerProcessor("guard-processor", GuardProcessor);
