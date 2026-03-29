// Shared neutral UI colours used across screens.
export const colors = {
  textPrimary: '#2a3a4a',
  textSecondary: '#5a7080',
  textMuted: '#4a6070',
  white: '#fff',
};

/**
 * Appends a two-digit hex alpha to a 6-digit #RRGGBB colour string.
 * @param {string} hexColor - Must be a 6-digit hex colour, e.g. '#4a90b8'
 * @param {number} opacity  - 0 to 1
 */
export function alpha(hexColor, opacity) {
  const hex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hexColor}${hex}`;
}
