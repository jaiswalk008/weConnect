/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (e.g., "1 Nov 2023")
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a date string to show only day and month (e.g., "1 Nov")
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (e.g., "1 Nov")
 */
export const formatDayMonth = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Format time from date string (e.g., "10:30 AM")
 * @param dateString - ISO date string or Date object
 * @returns Formatted time string
 */
export const formatTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get relative time from now (e.g., "2 hours ago", "yesterday", "1 week ago")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (seconds < 172800) return 'yesterday';
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} days ago`;
  }
  if (seconds < 2592000) {
    const weeks = Math.floor(seconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  return formatDate(date);
};

/**
 * Check if a date is today
 * @param dateString - ISO date string or Date object
 * @returns boolean
 */
export const isToday = (dateString: string | Date): boolean => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Format message timestamp with different formats based on time elapsed
 * @param dateString - ISO date string or Date object
 * @returns Formatted timestamp (e.g., "10:30 AM", "Yesterday", "1 Nov", "1 Nov 2022")
 */
export const formatMessageTimestamp = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isCurrentYear = now.getFullYear() === date.getFullYear();

  if (diffDays === 0) {
    return formatTime(date);
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else if (isCurrentYear) {
    return formatDayMonth(date);
  } else {
    return formatDate(date); // This will show full date with year (e.g., "1 Nov 2022")
  }
};
