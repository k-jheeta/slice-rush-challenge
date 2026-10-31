// Provided as a worked example for Part 2: small, pure, fully tested.

/** Pence -> "£12.50". Negative values: "-£1.20". */
export function formatMoney(pence: number): string {
  const sign = pence < 0 ? '-' : '';
  const abs = Math.abs(Math.round(pence));
  const pounds = Math.floor(abs / 100).toLocaleString('en-GB');
  return `${sign}£${pounds}.${String(abs % 100).padStart(2, '0')}`;
}

/** Ticket number -> "#0104" (at least 4 digits) */
export function formatTicket(ticket: number): string {
  return `#${String(ticket).padStart(4, '0')}`;
}

/**
 * Countdown until `etaAt`, for the kitchen board.
 *   more than 0s left  -> "m:ss" (e.g. "4:05", "12:00")
 *   0-14s overdue      -> "Due"
 *   15s+ overdue       -> "+m:ss" (late, e.g. "+1:20")
 */
export function formatEta(etaAt: number, now: number): string {
  const diff = Math.ceil((etaAt - now) / 1000);
  if (diff > 0) return clock(diff);
  if (diff > -15) return 'Due';
  return `+${clock(-diff)}`;
}

function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
/** Epoch millis -> "18:30" (UTC so tests are stable) */
export function formatTime(ts: number): string {
  return timeFmt.format(ts);
}
