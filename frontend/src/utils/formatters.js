/**
 * Formatting utilities for timestamps, currencies and countdowns
 */

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getTimeRemaining(endTimeStr) {
  const total = Date.parse(endTimeStr) - Date.now();
  if (total <= 0) {
    return { total: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true, display: 'Ended' };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor(total / (1000 * 60 * 60));

  let display = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    display = `${days}d ${remHours}h left`;
  } else if (hours > 0) {
    display = `${hours}h ${minutes}m left`;
  } else {
    display = `${minutes}m ${seconds}s left`;
  }

  return { total, hours, minutes, seconds, isEnded: false, display };
}

export function formatTimeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
