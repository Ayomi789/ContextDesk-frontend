/** Timezone chosen in Settings → Appearance (falls back to the browser). */
export function getTimeZone(): string {
  if (typeof window === 'undefined') return 'UTC';
  try {
    return (
      localStorage.getItem('nexus-timezone') ||
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  } catch {
    return 'UTC';
  }
}

function withZone(
  value: string | Date,
  opts: Intl.DateTimeFormatOptions
): string {
  try {
    return new Date(value).toLocaleString('en', {
      ...opts,
      timeZone: getTimeZone(),
    });
  } catch {
    return new Date(value).toLocaleString('en', opts);
  }
}

export function formatDate(value: string | Date): string {
  return withZone(value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value: string | Date): string {
  return withZone(value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatWeekday(value: string | Date): string {
  return withZone(value, { weekday: 'short' });
}
