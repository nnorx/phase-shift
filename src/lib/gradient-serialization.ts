import type { Gradient } from "@/types/gradient";
import { MAX_GRADIENTS_IMPORT } from "./config";
import { generateId } from "./gradient-factories";
import { validateGradient } from "./gradient-validation";

/**
 * Gradient serialization and deserialization for URL sharing
 */

/**
 * Round a number to specified decimal places
 */
function round(num: number, decimals: number = 2): number {
	const factor = 10 ** decimals;
	return Math.round(num * factor) / factor;
}

/**
 * Prepare gradient for encoding by removing unnecessary fields and rounding values
 */
function prepareGradientForEncoding(gradient: Gradient) {
	return {
		colorStops: gradient.colorStops.map((stop) => ({
			color: stop.color,
			x: round(stop.x),
			y: round(stop.y),
			intensity: round(stop.intensity),
			scaleX: round(stop.scaleX),
			scaleY: round(stop.scaleY),
			rotation: round(stop.rotation),
		})),
		blendMode: gradient.blendMode,
		// Intentionally omit id and createdAt - they'll be regenerated on decode
	};
}

/**
 * Encode gradients array to URL-safe base64 string
 * Optimized for shorter URLs by removing id/createdAt and rounding values
 */
export function encodeGradients(gradients: Gradient[]): string {
	try {
		// Strip unnecessary fields and round values for shorter encoding
		const optimized = gradients.map(prepareGradientForEncoding);
		const json = JSON.stringify(optimized);
		// Use btoa for base64 encoding, then make URL-safe
		return btoa(json)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=+$/, "");
	} catch (error) {
		console.error("Failed to encode gradients:", error);
		return "";
	}
}

/**
 * Decode URL-safe base64 string to gradients array
 * Regenerates id and createdAt fields that were stripped during encoding
 */
export function decodeGradients(
	encoded: string,
	onError?: (message: string) => void,
): Gradient[] {
	try {
		// Restore standard base64 format
		let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
		// Add padding if needed
		while (base64.length % 4) {
			base64 += "=";
		}
		const json = atob(base64);
		const parsed = JSON.parse(json) as Array<Partial<Gradient>>;

		// Validate and restore full gradient objects
		if (!Array.isArray(parsed)) {
			onError?.("Invalid gradient data format");
			return [];
		}

		// Enforce maximum gradients limit to prevent performance issues
		if (parsed.length > MAX_GRADIENTS_IMPORT) {
			onError?.(
				`Too many gradients in link. Maximum ${MAX_GRADIENTS_IMPORT} allowed.`,
			);
			return [];
		}

		const gradients: Gradient[] = [];
		for (const item of parsed) {
			// Validate the gradient data
			if (!validateGradient(item)) {
				continue;
			}

			// Regenerate id and createdAt (they were stripped during encoding)
			gradients.push({
				id: generateId(),
				colorStops: item.colorStops || [],
				blendMode: item.blendMode || "lighter",
				createdAt: Date.now(),
			});
		}

		if (gradients.length === 0) {
			onError?.("No valid gradients found in shared link");
		}

		return gradients;
	} catch (error) {
		console.error("Failed to decode gradients:", error);
		onError?.(
			error instanceof Error
				? `Decode error: ${error.message}`
				: "Invalid or corrupted share link",
		);
		return [];
	}
}
