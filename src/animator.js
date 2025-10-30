// src/animator.js
// Animator manages timeline, play/pause and interpolation between positions.
import { clamp } from './utils.js';
export class Animator {
  /**
   * @param {CanvasRenderer} renderer
   * @param {HTMLInputElement} timelineEl - optional (keeps in sync)
   * @param {Function} onStateChange - optional callback(state) called whenever state updates
   */
  constructor(renderer, timelineEl = null, onStateChange = null) {
    this.renderer = renderer;
    this.timelineEl = timelineEl;
    this.onStateChange = onStateChange;
    this.sim = null;
    this.isPlaying = false;
    this.currentStep = 0; // number of requests served so far
    this.headPosition = 0;
    this._raf = null;
    this.speed = 1;
    this.msPerCylinder = 8; // base milliseconds per cylinder (tweakable)
    this._segmentStartTime = 0;
    this._segmentDuration = 0;
    this._segmentFrom = 0;
    this._segmentTo = 0;
  }

  load(simulation) {
    // simulation expected: { diskMax, headStart, serviceOrder, positions, metrics }
    this.sim = simulation;
    this.currentStep = 0;
    this.headPosition = simulation.positions ? simulation.positions[0] : simulation.headStart;
    this._stopRAF();
    this._updateTimelineRange();
    this._renderCurrent();
  }

  setSpeed(multiplier) {
    this.speed = multiplier || 1;
  }

  _updateTimelineRange() {
    if (this.timelineEl && this.sim) {
      const steps = (this.sim.serviceOrder || []).length;
      this.timelineEl.max = String(steps);
      this.timelineEl.value = String(this.currentStep);
    }
  }

  _renderCurrent() {
    if (!this.sim) return;
    const state = {
      diskMax: this.sim.diskMax,
      serviceOrder: this.sim.serviceOrder,
      positions: this.sim.positions,
      currentStep: this.currentStep,
      headPosition: this.headPosition
    };
    this.renderer.draw(state);
    if (this.onStateChange) this.onStateChange(state);
    this._updateTimelineRange();
  }

  // Start playing from currentStep (if at end, do nothing)
  play() {
    if (!this.sim) return;
    if (this.currentStep >= (this.sim.serviceOrder || []).length) return;
    if (this.isPlaying) return;
    this.isPlaying = true;
    this._startSegment(this.currentStep);
    this._raf = requestAnimationFrame(this._tick.bind(this));
  }

  pause() {
    this.isPlaying = false;
    this._stopRAF();
  }

  togglePlayPause() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  _stopRAF() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  }

  // Begin animating segment from positions[idx] to positions[idx+1]
  _startSegment(idx) {
    const positions = this.sim.positions;
    const from = positions[idx];
    const to = positions[idx + 1];
    this._segmentFrom = from;
    this._segmentTo = to;
    const distance = Math.abs(to - from);
    const base = this.msPerCylinder * distance;
    this._segmentDuration = Math.max(120, base / this.speed); // min duration for visibility
    this._segmentStartTime = performance.now();
  }

  _tick(now) {
    if (!this.isPlaying) return;
    const elapsed = now - this._segmentStartTime;
    const t = clamp(elapsed / this._segmentDuration, 0, 1);
    // linear interpolation
    this.headPosition = Math.round(this._segmentFrom + (this._segmentTo - this._segmentFrom) * t);
    this._renderCurrent();

    if (t >= 1) {
      // segment completed
      this.currentStep = Math.min(this.currentStep + 1, (this.sim.serviceOrder || []).length);
      if (this.currentStep >= (this.sim.serviceOrder || []).length) {
        // reached end
        this.isPlaying = false;
        this._stopRAF();
        // final render with exact final head position
        this.headPosition = this.sim.positions[this.sim.positions.length - 1];
        this._renderCurrent();
        return;
      }
      // start next segment
      this._startSegment(this.currentStep);
    }
    this._raf = requestAnimationFrame(this._tick.bind(this));
  }

  // Step forward: jump to next step end
  stepForward() {
    if (!this.sim) return;
    const steps = (this.sim.serviceOrder || []).length;
    this.pause();
    this.currentStep = clamp(this.currentStep + 1, 0, steps);
    this.headPosition = this.sim.positions[this.currentStep];
    this._renderCurrent();
  }

  // Step back: jump to previous step end
  stepBack() {
    if (!this.sim) return;
    this.pause();
    this.currentStep = clamp(this.currentStep - 1, 0, (this.sim.serviceOrder || []).length);
    this.headPosition = this.sim.positions[this.currentStep];
    this._renderCurrent();
  }

  // Seek to arbitrary step index (0..N)
  seek(stepIndex) {
    if (!this.sim) return;
    const steps = (this.sim.serviceOrder || []).length;
    const idx = clamp(Math.floor(stepIndex), 0, steps);
    this.pause();
    this.currentStep = idx;
    this.headPosition = this.sim.positions[this.currentStep];
    this._renderCurrent();
  }
}

// small helper
//function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
