// src/algorithms.js
// Implements SCAN and C-SCAN and metrics calculation.

/**
 * Clean and clamp requests to integers inside [0, diskMax].
 * Keeps duplicates (they are valid requests).
 */
export function sanitizeRequests(requests, diskMax) {
  return requests
    .map(n => Math.floor(Number(n)))
    .filter(n => Number.isFinite(n) && n >= 0 && n <= diskMax);
}

/**
 * SCAN (elevator) algorithm.
 * @param {number[]} requests - sanitized array
 * @param {number} head - starting head position
 * @param {number} direction - 1 (increasing) or -1 (decreasing)
 * @param {number} diskMax - max cylinder (inclusive)
 * @returns {number[]} service order (array of cylinder numbers)
 */
export function scan(requests, head, direction, diskMax) {
  const left = requests.filter(r => r < head).sort((a, b) => a - b);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);
  const order = [];

  if (+direction === 1) {
    order.push(...right);
    // after moving right, reverse to service remaining on left
    order.push(...left.reverse());
  } else {
    order.push(...left.reverse());
    order.push(...right);
  }

  return order;
}

/**
 * C-SCAN algorithm.
 * Treats disk as circular: when head reaches end, it jumps to the other end.
 */
export function cscan(requests, head, direction, diskMax) {
  const left = requests.filter(r => r < head).sort((a, b) => a - b);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);
  const order = [];

  if (+direction === 1) {
    order.push(...right);
    // jump to start and service the left in increasing order
    order.push(...left);
  } else {
    order.push(...left.reverse());
    order.push(...right.reverse());
  }

  return order;
}

/**
 * Compute metrics and per-step head positions.
 * positions array = [headStart, served1, served2, ...]
 * metrics: totalHeadMovement, averageSeek, waitingMovements array (per request)
 */
export function computeMetrics(headStart, serviceOrder) {
  const positions = [headStart, ...serviceOrder];
  let total = 0;
  const waitingMovements = []; // movement until each request is served

  for (let i = 0; i < positions.length - 1; i++) {
    const d = Math.abs(positions[i + 1] - positions[i]);
    total += d;
    waitingMovements.push(total); // waiting measured in head movement until served
  }

  const avg = serviceOrder.length ? total / serviceOrder.length : 0;

  return {
    positions, // includes initial head
    serviceOrder,
    totalHeadMovement: total,
    averageSeek: avg,
    waitingMovements, // same length as serviceOrder
  };
}
