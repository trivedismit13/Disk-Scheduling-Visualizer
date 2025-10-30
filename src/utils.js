// src/utils.js
export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export function formatNumber(n) {
  if (Number.isFinite(n)) return (Math.round(n * 100) / 100).toLocaleString();
  return '-';
}
