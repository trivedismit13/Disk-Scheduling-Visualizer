// src/canvasRenderer.js
// Lightweight canvas renderer for linear disk visualization

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this.colors = this._readCSSColors();
  }

  _readCSSColors() {
    const s = getComputedStyle(document.documentElement);
    return {
      bg: s.getPropertyValue('--bg') || '#0B0E12',
      primary: s.getPropertyValue('--primary') || '#00E5FF',
      accent: s.getPropertyValue('--accent') || '#FFB86B',
      served: s.getPropertyValue('--served') || '#7EE787',
      pending: s.getPropertyValue('--pending') || '#9AA3B2',
      text: s.getPropertyValue('--text') || '#E6EEF3',
    };
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(600, Math.floor(rect.width * this.dpr));
    this.canvas.height = Math.max(200, Math.floor(rect.height * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
    this.margin = 36; // left/right padding for track
  }

  /**
   * Map cylinder number to x coordinate on canvas.
   */
  _xFor(cylinder, diskMax) {
    const usable = this.width - this.margin * 2;
    const frac = diskMax === 0 ? 0 : (cylinder / diskMax);
    return this.margin + frac * usable;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    // subtle background
    this.ctx.fillStyle = this.colors.bg;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  draw(state) {
    // state: { diskMax, positions, currentStep, headPosition, serviceOrder, servedIndices }
    this.clear();
    const ctx = this.ctx;
    const { diskMax, serviceOrder = [], positions = [], currentStep = 0 } = state;
    const headX = this._xFor(state.headPosition, diskMax);

    // draw track line
    const y = Math.round(this.height / 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = this.colors.primary;
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.moveTo(this.margin, y);
    ctx.lineTo(this.width - this.margin, y);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // draw ticks (every 10%)
    ctx.fillStyle = this.colors.pending;
    ctx.font = '12px ' + (getComputedStyle(document.documentElement).getPropertyValue('--mono-font') || 'monospace');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const ticks = 10;
    for (let i = 0; i <= ticks; i++) {
      const cx = this.margin + (i / ticks) * (this.width - this.margin * 2);
      ctx.fillStyle = this.colors.pending;
      ctx.fillRect(cx - 0.5, y - 6, 1, 12);
      const label = Math.round((i / ticks) * diskMax).toString();
      ctx.fillStyle = this.colors.text;
      ctx.fillText(label, cx, y + 12);
    }

    // draw path trace (visited positions up to currentStep)
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.colors.primary;
    ctx.globalAlpha = 0.16;
    for (let i = 0; i <= currentStep && i < positions.length; i++) {
      const x = this._xFor(positions[i], diskMax);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // draw pending requests as circles; mark served vs pending vs current
    for (let i = 0; i < serviceOrder.length; i++) {
      const req = serviceOrder[i];
      const x = this._xFor(req, diskMax);
      const isServed = i < currentStep;
      const isCurrent = i === currentStep;
      // circle
      ctx.beginPath();
      ctx.arc(x, y - 28, 12, 0, Math.PI * 2);
      ctx.fillStyle = isServed ? this.colors.served : (isCurrent ? this.colors.accent : this.colors.pending);
      ctx.globalAlpha = isServed ? 0.9 : (isCurrent ? 1 : 0.9);
      ctx.fill();
      // label inside circle
      ctx.fillStyle = '#071018';
      ctx.font = '11px ' + (getComputedStyle(document.documentElement).getPropertyValue('--mono-font') || 'monospace');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(req), x, y - 28);
      ctx.globalAlpha = 1;
    }

    // draw head as a rectangle with neon outline
    ctx.beginPath();
    ctx.fillStyle = this.colors.accent;
    ctx.strokeStyle = this.colors.primary;
    ctx.lineWidth = 2;
    ctx.roundRect ? ctx.roundRect(headX - 10, y - 8, 20, 16, 4) : null;
    // fallback rectangle
    ctx.fillRect(headX - 10, y - 8, 20, 16);
    ctx.strokeRect(headX - 10, y - 8, 20, 16);
    // head label
    ctx.fillStyle = this.colors.text;
    ctx.font = '12px ' + (getComputedStyle(document.documentElement).getPropertyValue('--mono-font') || 'monospace');
    ctx.textAlign = 'center';
    ctx.fillText(String(state.headPosition), headX, y + 30);
  }
}

// Add roundRect polyfill for older browsers if not present on ctx
CanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.roundRect || function(x, y, w, h, r){
  if (r === undefined) r = 4;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  this.fill();
};
