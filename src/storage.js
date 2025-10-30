// src/storage.js
import { downloadBlob } from './utils.js';

export function exportTraceJSON(simulation) {
  const blob = new Blob([JSON.stringify(simulation, null, 2)], { type: 'application/json' });
  downloadBlob('disk-simulation-trace.json', blob);
}

export function exportCSV(simulation) {
  // Simple CSV: step,headPosition,servedRequest (if any),cumulativeMovement
  const rows = [];
  rows.push(['step','headPosition','servedRequest'].join(','));
  const pos = simulation.positions; // positions array
  const service = simulation.serviceOrder || [];
  // step 0 = initial pos (no served)
  rows.push([0, pos[0], ''].join(','));
  for (let i = 0; i < service.length; i++) {
    rows.push([i+1, pos[i+1], service[i]].join(','));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  downloadBlob('disk-simulation-trace.csv', blob);
}

export function screenshotCanvas(canvas, filename = 'disk-screenshot.png') {
  const data = canvas.toDataURL('image/png');
  // convert to blob
  fetch(data)
    .then(res => res.blob())
    .then(blob => {
      downloadBlob(filename, blob);
    });
}
