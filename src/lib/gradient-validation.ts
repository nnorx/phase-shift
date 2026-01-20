import type { BlendMode, Gradient } from "@/types/gradient";
import {
	MAX_COLOR_STOPS,
	MAX_INTENSITY,
	MAX_POSITION,
	MAX_ROTATION,
	MAX_SCALE,
	MIN_INTENSITY,
	MIN_POSITION,
	MIN_ROTATION,
	MIN_SCALE,
} from "./config";

/**
 * Gradient validation and metadata utilities
 */

/**
 * Valid blend modes for gradients
 */
const VALID_BLEND_MODES: BlendMode[] = [
	"lighter",
	"multiply",
	"screen",
	"overlay",
	"color-dodge",
	"color-burn",
	"hard-light",
	"soft-light",
	"difference",
	"exclusion",
];

/**
 * Validate gradient configuration
 */
export function validateGradient(gradient: Partial<Gradient>): boolean {
	if (!gradient.colorStops || gradient.colorStops.length < 1) {
		return false;
	}

	// Enforce maximum color stops limit to prevent performance issues
	if (gradient.colorStops.length > MAX_COLOR_STOPS) {
		return false;
	}

	// Validate blend mode if present (optional for backward compatibility)
	if (
		gradient.blendMode !== undefined &&
		!VALID_BLEND_MODES.includes(gradient.blendMode)
	) {
		return false;
	}

	// Validate hex color format and positions
	const hexRegex = /^#[0-9A-Fa-f]{6}$/;
	for (const stop of gradient.colorStops) {
		// Validate color format
		if (!hexRegex.test(stop.color)) {
			return false;
		}

		// Validate all required numeric fields exist and are valid
		if (
			typeof stop.x !== "number" ||
			typeof stop.y !== "number" ||
			typeof stop.intensity !== "number" ||
			typeof stop.scaleX !== "number" ||
			typeof stop.scaleY !== "number" ||
			typeof stop.rotation !== "number"
		) {
			return false;
		}

		// Validate numeric ranges
		if (
			stop.x < MIN_POSITION ||
			stop.x > MAX_POSITION ||
			stop.y < MIN_POSITION ||
			stop.y > MAX_POSITION ||
			stop.intensity < MIN_INTENSITY ||
			stop.intensity > MAX_INTENSITY
		) {
			return false;
		}

		// Validate distortion parameters
		if (stop.scaleX < MIN_SCALE || stop.scaleX > MAX_SCALE) {
			return false;
		}
		if (stop.scaleY < MIN_SCALE || stop.scaleY > MAX_SCALE) {
			return false;
		}
		if (stop.rotation < MIN_ROTATION || stop.rotation > MAX_ROTATION) {
			return false;
		}
	}

	return true;
}

/**
 * Get all available blend modes with descriptions
 */
export function getBlendModes(): Array<{
	value: BlendMode;
	label: string;
	description: string;
}> {
	return [
		{
			value: "lighter",
			label: "Lighter (Additive)",
			description: "Bright, glowing overlaps - great for vibrant effects",
		},
		{
			value: "multiply",
			label: "Multiply",
			description: "Darker, richer overlaps - creates depth",
		},
		{
			value: "screen",
			label: "Screen",
			description: "Lighter, dreamy effect - soft and airy",
		},
		{
			value: "overlay",
			label: "Overlay",
			description: "Maintains highlights and shadows - balanced contrast",
		},
		{
			value: "color-dodge",
			label: "Color Dodge",
			description: "Dramatic color intensification - vivid and bold",
		},
		{
			value: "color-burn",
			label: "Color Burn",
			description: "Deep, saturated colors - intense and moody",
		},
		{
			value: "hard-light",
			label: "Hard Light",
			description: "Strong contrast - sharp and defined",
		},
		{
			value: "soft-light",
			label: "Soft Light",
			description: "Subtle contrast - gentle and smooth",
		},
		{
			value: "difference",
			label: "Difference",
			description: "Inverted overlaps - experimental and unique",
		},
		{
			value: "exclusion",
			label: "Exclusion",
			description: "Similar to difference but softer - creative effects",
		},
	];
}
