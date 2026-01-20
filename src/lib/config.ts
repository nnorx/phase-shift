/**
 * Application configuration and constants
 */

// ============================================================================
// Security & Performance Limits
// ============================================================================

/** Maximum color stops allowed per gradient (prevents performance issues) */
export const MAX_COLOR_STOPS = 20;

/** Maximum gradients that can be imported from a URL (prevents DoS) */
export const MAX_GRADIENTS_IMPORT = 100;

/** Maximum size of base64-encoded gradient data in URL (~50KB) */
export const MAX_ENCODED_SIZE = 50000;

/** Maximum URL length to ensure browser compatibility */
export const MAX_URL_LENGTH = 8000;

// ============================================================================
// Storage & Persistence
// ============================================================================

/** LocalStorage key for persisting gradients */
export const STORAGE_KEY = "phase-shift-gradients";

/** URL query parameter name for sharing gradients */
export const URL_PARAM = "gradients";

// ============================================================================
// Gradient Constraints
// ============================================================================

/** Minimum intensity value for color stops */
export const MIN_INTENSITY = 10;

/** Maximum intensity value for color stops */
export const MAX_INTENSITY = 100;

/** Minimum scale value for ellipse distortion */
export const MIN_SCALE = 0.5;

/** Maximum scale value for ellipse distortion */
export const MAX_SCALE = 2;

/** Minimum rotation value in degrees */
export const MIN_ROTATION = 0;

/** Maximum rotation value in degrees */
export const MAX_ROTATION = 360;

/** Minimum position value (percentage) */
export const MIN_POSITION = 0;

/** Maximum position value (percentage) */
export const MAX_POSITION = 100;

// ============================================================================
// Export Rate Limiting
// ============================================================================

/** Minimum milliseconds between canvas exports (prevents browser crashes) */
export const MIN_EXPORT_INTERVAL = 1000;
