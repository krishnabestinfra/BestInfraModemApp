/**
 * Formats a date string to display format: "Nov 11, 2025 03:00 PM"
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string or original string if parsing fails
 */
export const formatDisplayDateTime = (dateString) => {
  if (!dateString || dateString === 'N/A') return 'N/A';

  const normalizeInput = (value) => value.replace(/\s+/g, ' ').trim();
  const formatParts = (date) => {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hours % 12) || 12).toString().padStart(2, '0');
    const formattedMinute = minutes.toString().padStart(2, '0');
    return `${month} ${day}, ${year} ${formattedHour}:${formattedMinute} ${period}`;
  };

  try {
    const normalized = normalizeInput(dateString);
    const parts = normalized.split(' ');
    const candidate = parts.length >= 5 ? parts.slice(0, 5).join(' ') : normalized;
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return formatParts(parsed);
    }
  } catch {
    // fall through to regex fallback
  }

  // Try parsing if date and time are separate
  try {
    const normalized = normalizeInput(dateString);
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return formatParts(parsed);
    }
  } catch {
    // fall through
  }

  return dateString; // Return original if parsing fails
};

