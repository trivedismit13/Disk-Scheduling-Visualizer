// src/ui.js

const fields = ["diskSize", "headStart", "direction", "algorithm", "queueInput"];
fields.forEach(id => {
  const el = document.getElementById(id);
  const saved = localStorage.getItem(id);
  if (saved) el.value = saved;
  el.addEventListener("change", () => localStorage.setItem(id, el.value));
});


import { sanitizeRequests, scan, cscan, computeMetrics } from './algorithms.js';
import { CanvasRenderer } from './canvasrenderer.js';
import { Animator } from './animator.js';
import * as storage from './storage.js';
import { formatNumber, clamp } from './utils.js';

const el = id => document.getElementById(id);

const canvas = el('diskCanvas');
const renderer = new CanvasRenderer(canvas);

const timelineEl = el('timeline');
const animator = new Animator(renderer, timelineEl, onStateChange);

// Controls
const diskSizeInput = el('diskSize');
const headInput = el('headStart');
const directionInput = el('direction');
const algorithmInput = el('algorithm');
const queueInput = el('queueInput');
const btnCompute = el('btnCompute');
const btnExport = el('btnExport');
const btnExportSmall = el('btnExportSmall');
const btnScreenshot = el('btnScreenshot');
const btnScreenshotSmall = el('btnScreenshotSmall');
const btnPlayPause = el('btnPlayPause');
const btnStepFwd = el('btnStepFwd');
const btnStepBack = el('btnStepBack');
const speedInput = el('speed');
const statsEl = el('stats');

// initial UI state
btnPlayPause.disabled = true;
btnStepFwd.disabled = true;
btnStepBack.disabled = true;
btnExport.disabled = true;
btnExportSmall.disabled = true;
btnScreenshot.disabled = true;
btnScreenshotSmall.disabled = true;

let latestSim = null;

btnCompute.addEventListener('click', onCompute);
btnPlayPause.addEventListener('click', () => {animator.togglePlayPause(); updatePlayButton(); });
btnStepFwd.addEventListener('click', () => animator.stepForward());
btnStepBack.addEventListener('click', () => animator.stepBack());
speedInput.addEventListener('input', () => animator.setSpeed(Number(speedInput.value)));
timelineEl.addEventListener('input', () => animator.seek(Number(timelineEl.value)));

// wire exports & screenshots (both large & small buttons)
btnExport.addEventListener('click', () => exportTrace());
btnExportSmall.addEventListener('click', () => exportTrace());
btnScreenshot.addEventListener('click', () => screenshot());
btnScreenshotSmall.addEventListener('click', () => screenshot());

window.addEventListener('keydown', (ev) => {
  if (ev.code === 'Space') { ev.preventDefault(); animator.togglePlayPause(); updatePlayButton(); }
  if (ev.key === 'ArrowRight') { animator.stepForward(); }
  if (ev.key === 'ArrowLeft') { animator.stepBack(); }
  if (ev.key.toLowerCase() === 'e') { exportTrace(); }
  if (ev.key.toLowerCase() === 's') { screenshot(); }
});

// Compute handler
function onCompute() {
  const diskMax = Math.max(1, Math.floor(Number(diskSizeInput.value) || 199));
  const headStart = clamp(Math.floor(Number(headInput.value) || 0), 0, diskMax);
  const direction = Number(directionInput.value) === -1 ? -1 : 1;
  const algorithm = algorithmInput.value;
  const rawQueue = queueInput.value.split(',').map(s => s.trim()).filter(s => s !== '').map(Number);

  const requests = sanitizeRequests(rawQueue, diskMax);
  if (requests.length === 0) {
    statsEl.textContent = 'No valid requests (0..' + diskMax + ') — enter comma separated integers.';
    return;
  }

  let serviceOrder = algorithm === 'scan'
    ? scan(requests, headStart, direction, diskMax)
    : cscan(requests, headStart, direction, diskMax);

  // metrics & positions
  const metrics = computeMetrics(headStart, serviceOrder);
  const simulation = {
    diskMax,
    headStart,
    direction,
    algorithm,
    serviceOrder: metrics.serviceOrder,
    positions: metrics.positions,
    totalHeadMovement: metrics.totalHeadMovement,
    averageSeek: metrics.averageSeek,
    waitingMovements: metrics.waitingMovements
  };

  latestSim = simulation;
  animator.load(simulation);
  updatePlayButton();
  updateUIAfterLoad();
  renderStats(simulation);
}

// UI after loading a simulation
function updateUIAfterLoad() {
  const hasSim = !!latestSim;
  btnPlayPause.disabled = !hasSim;
  btnStepFwd.disabled = !hasSim;
  btnStepBack.disabled = !hasSim;
  btnExport.disabled = !hasSim;
  btnExportSmall.disabled = !hasSim;
  btnScreenshot.disabled = !hasSim;
  btnScreenshotSmall.disabled = !hasSim;
  // timeline range set by animator
}

// export helpers
function exportTrace() {
  if (!latestSim) return;
  // build friendly JSON with meta + metrics
  const payload = {
    meta: {
      diskMax: latestSim.diskMax,
      headStart: latestSim.headStart,
      direction: latestSim.direction,
      algorithm: latestSim.algorithm,
      createdAt: new Date().toISOString()
    },
    serviceOrder: latestSim.serviceOrder,
    positions: latestSim.positions,
    totalHeadMovement: latestSim.totalHeadMovement,
    averageSeek: latestSim.averageSeek,
    waitingMovements: latestSim.waitingMovements
  };
  storage.exportTraceJSON(payload);
}

// screenshot
function screenshot() {
  storage.screenshotCanvas(canvas);
}

// Called by animator whenever state updates
function onStateChange(state) {
  // update small status text
  const step = state.currentStep || 0;
  const total = (latestSim && latestSim.serviceOrder) ? latestSim.serviceOrder.length : 0;
  const pos = state.headPosition;
  statsEl.innerText = `Step ${step} / ${total}\nHead at: ${pos}\nTotal movement: ${latestSim ? formatNumber(latestSim.totalHeadMovement) : '-'}\nAverage seek: ${latestSim ? formatNumber(latestSim.averageSeek) : '-'}`;
  // update timeline input
  if (timelineEl && latestSim) {
    timelineEl.value = String(step);
    timelineEl.max = String(total);
  }
  updatePlayButton();
}

// Render stats panel with more detail after compute
function renderStats(sim) {
  const lines = [];
  lines.push(`Algorithm: ${sim.algorithm.toUpperCase()}`);
  lines.push(`Disk max: 0 .. ${sim.diskMax}`);
  lines.push(`Head start: ${sim.headStart}`);
  lines.push(`Requests: ${sim.serviceOrder.length}`);
  lines.push(`Service order: ${sim.serviceOrder.join(', ')}`);
  lines.push(`Total head movement: ${formatNumber(sim.totalHeadMovement)} cylinders`);
  lines.push(`Average seek per request: ${formatNumber(sim.averageSeek)} cylinders`);
  statsEl.innerText = lines.join('\n');
}

// update play button visual (toggle ▶ / ❚❚)
function updatePlayButton() {
  if (!latestSim) {
    btnPlayPause.textContent = '▶';
    return;
  }
  btnPlayPause.textContent = animator.isPlaying ? '❚❚' : '▶';
}

// small clamp fallback
//function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// expose for console debugging (optional)
window._diskViz = {
  compute: onCompute,
  animator,
  renderer,
  latestSim
};
