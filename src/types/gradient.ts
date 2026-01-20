/**
 * Represents a color with position and intensity in a mesh gradient
 */
export interface ColorStop {
	color: string; // hex color value
	x: number; // horizontal position 0-100
	y: number; // vertical position 0-100
	intensity: number; // spread/radius 10-100
	scaleX: number; // horizontal scale 0.5-2.0 for ellipse shape
	scaleY: number; // vertical scale 0.5-2.0 for ellipse shape
	rotation: number; // rotation in degrees 0-360
}

/**
 * Blend modes for mesh gradients
 */
export type BlendMode =
	| "lighter" // Additive blending (default)
	| "multiply" // Darker, richer overlaps
	| "screen" // Lighter, dreamy effect
	| "overlay" // Maintains highlights and shadows
	| "color-dodge" // Dramatic color intensification
	| "color-burn" // Deep, saturated colors
	| "hard-light" // Strong contrast
	| "soft-light" // Subtle contrast
	| "difference" // Inverted overlaps
	| "exclusion"; // Similar to difference but softer

/**
 * Mesh gradient configuration
 */
export interface Gradient {
	id: string;
	colorStops: ColorStop[];
	blendMode?: BlendMode; // Blend mode for color mixing (default: "lighter")
	createdAt: number; // timestamp
}

export interface GradientConfig {
	colorStops: ColorStop[];
	blendMode?: BlendMode;
}
