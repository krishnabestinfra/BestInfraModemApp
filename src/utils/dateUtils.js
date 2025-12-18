/**
 * Date formatting utilities
 * Centralized date formatting functions for consistent display across the app
 */

/**
 * Format date string for display
 * Converts various date formats to: "MMM DD, YYYY HH:MM AM/PM"
 * 
 * @param {string} dateString - Date string in various formats
 * @returns {string} Formatted date string or original if parsing fails
 * 
 * @example

 */
export const formatDisplayDateTime = (dateString) => {
  if (!dateString || dateString === 'N/A') return 'N/A';

  const normalizeInput = (value) => value.replace(/\s+/g, ' ').trim();
  
  const formatParts = (date) => {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hours % 12) || 12).toString().padStart(2, '0');
    const formattedMinute = minutes.toString().padStart(2, '0');
    return `${month} ${day}, ${year} ${formattedHour}:${formattedMinute} ${period}`;
  };

  // Try parsing with Date constructor
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

  // Regex fallback for formats like "21 Nov 2024 14:30" or "21 Nov 2024 2:30 PM"
  const regex = /(\d{1,2})\s([A-Za-z]{3})\s(\d{4})\s(\d{1,2}):(\d{2})(?::\d{2})?\s?(AM|PM)?/i;
  const match = dateString.match(regex);
  if (match) {
    const [, day, monthStr, year, hourStr, minuteStr, suffix] = match;
    const month = monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase();
    const hourNum = Number(hourStr);
    const period = suffix?.toUpperCase() ?? 'AM';
    const formattedHour = ((hourNum % 12) || 12).toString().padStart(2, '0');
    const formattedMinute = minuteStr.padStart(2, '0');
    return `${month} ${day.padStart(2, '0')}, ${year} ${formattedHour}:${formattedMinute} ${period}`;
  }

  // Fallback: return truncated string if too long
  return dateString.length > 20 ? dateString.substring(0, 20) : dateString;
};
