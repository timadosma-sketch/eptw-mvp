import { format, formatDistanceToNow, parseISO, isAfter, isBefore, addHours } from 'date-fns';

// ----------------------------------------------------------
// Date / Time formatters
// ----------------------------------------------------------

export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), 'dd MMM yyyy HH:mm');
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), 'dd MMM yyyy');
  } catch {
    return iso;
  }
}

export function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), 'HH:mm');
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatDuration(fromIso: string, toIso: string): string {
  try {
    const from = parseISO(fromIso);
    const to   = parseISO(toIso);
    const diffMs  = to.getTime() - from.getTime();
    const hours   = Math.floor(diffMs / 3_600_000);
    const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  } catch {
    return '--';
  }
}

export function isExpiringSoon(validToIso: string, withinHours = 2): boolean {
  try {
    const exp     = parseISO(validToIso);
    const horizon = addHours(new Date(), withinHours);
    return isBefore(exp, horizon) && isAfter(exp, new Date());
  } catch {
    return false;
  }
}

export function isExpired(validToIso: string): boolean {
  try {
    return isBefore(parseISO(validToIso), new Date());
  } catch {
    return false;
  }
}

// ----------------------------------------------------------
// Number / Value formatters
// ----------------------------------------------------------

export function formatGasValue(value: number, unit: string, decimals = 1): string {
  return `${value.toFixed(decimals)} ${unit}`;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatPermitNumber(number: string): string {
  return number; // already formatted e.g. PTW-2024-0841
}

// ----------------------------------------------------------
// Text helpers
// ----------------------------------------------------------

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ----------------------------------------------------------
// Permit helpers
// ----------------------------------------------------------

export function getTimeRemaining(validToIso: string): string {
  try {
    const now = new Date();
    const exp = parseISO(validToIso);
    if (isBefore(exp, now)) return 'Expired';
    const diffMs  = exp.getTime() - now.getTime();
    const hours   = Math.floor(diffMs / 3_600_000);
    const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  } catch {
    return '--';
  }
}

export function buildCorrelationId(): string {
  return `corr-${Math.random().toString(36).slice(2, 10)}`;
}
