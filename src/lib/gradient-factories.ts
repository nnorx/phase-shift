import type { ColorStop, Gradient, GradientConfig } from "@/types/gradient";

/**
 * Factory functions for creating gradient-related objects
 */

/**
 * Generate a unique ID for a gradient
 */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Generate random position for a color stop
 */
export function generateRandomPosition(): { x: number; y: number } {
	return {
		x: Math.random() * 100,
		y: Math.random() * 100,
	};
}

/**
 * Create a color stop from a hex color with random or specified position
 */
export function createColorStop(
	color: string,
	position?: { x: number; y: number },
	intensity: number = 60,
): ColorStop {
	const pos = position || generateRandomPosition();
	return {
		color,
		x: pos.x,
		y: pos.y,
		intensity,
		// Random ellipse distortion for organic shapes
		scaleX: 0.5 + Math.random() * 1.5, // 0.5 to 2.0
		scaleY: 0.5 + Math.random() * 1.5, // 0.5 to 2.0
		rotation: Math.random() * 360, // 0 to 360 degrees
	};
}

/**
 * Create a new gradient with default values
 */
export function createGradient(config: GradientConfig): Gradient {
	return {
		id: generateId(),
		colorStops: config.colorStops,
		blendMode: config.blendMode || "lighter",
		createdAt: Date.now(),
	};
}

/**
 * Get default gradient configuration
 */
export function getDefaultGradientConfig(): GradientConfig {
	return {
		colorStops: [],
		blendMode: "lighter",
	};
}
