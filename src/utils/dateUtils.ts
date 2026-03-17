/**
 * Date formatting utilities
 */

/**
 * Formats a date string to "YYYY-MM-DD HH:mm"
 * Removes T, Z and seconds
 */
export const formatDateTime = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const Y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, '0');
    const D = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    
    return `${Y}-${M}-${D} ${h}:${m}`;
  } catch (e) {
    return dateStr;
  }
};
