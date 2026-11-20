const DAY_MS = 86400000;

const FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export const dayLabel = (day: string): string =>
  FORMATTER.format(new Date(`${day}T00:00:00.000Z`));

export const shortDayLabel = (day: string): string =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00.000Z`)
  );

const pad = (value: number): string => String(value).padStart(2, '0');

/** Time left until the next UTC midnight: HH:MM:SS. */
export const countdownLabel = (now: number): string => {
  const next = (Math.floor(now / DAY_MS) + 1) * DAY_MS;
  const left = Math.max(0, next - now);
  const hours = Math.floor(left / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const orderText = (order: readonly number[]): string =>
  order.map((index) => index + 1).join(' → ');

export const resultText = (number: number, pushes: number, order: readonly number[]): string =>
  `Chain #${number} · 8/8 in ${pushes} push${pushes > 1 ? 'es' : ''} · ${orderText(order)}`;
