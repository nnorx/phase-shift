import type { Gradient } from "@/types/gradient";

/**
 * Get canvas context with proper settings
 */
function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const ctx = canvas.getContext("2d", { alpha: true });
	if (!ctx) {
		throw new Error("Failed to get canvas 2D context");
	}
	return ctx;
}

/**
 * Calculate average color from color stops for base fill
 */
function calculateAverageColor(colorStops: Array<{ color: string }>): string {
	if (colorStops.length === 0) return "#FFFFFF";

	let totalR = 0;
	let totalG = 0;
	let totalB = 0;

	for (const stop of colorStops) {
		const r = Number.parseInt(stop.color.slice(1, 3), 16);
		const g = Number.parseInt(stop.color.slice(3, 5), 16);
		const b = Number.parseInt(stop.color.slice(5, 7), 16);
		totalR += r;
		totalG += g;
		totalB += b;
	}

	const avgR = Math.round(totalR / colorStops.length);
	const avgG = Math.round(totalG / colorStops.length);
	const avgB = Math.round(totalB / colorStops.length);

	return `#${avgR.toString(16).padStart(2, "0")}${avgG.toString(16).padStart(2, "0")}${avgB.toString(16).padStart(2, "0")}`;
}

/**
 * Draw a mesh gradient by layering multiple radial gradients with proper blending
 */
export function drawGradient(
	canvas: HTMLCanvasElement,
	gradient: Gradient,
	size: number = 512,
) {
	// Set canvas size
	canvas.width = size;
	canvas.height = size;

	const ctx = getContext(canvas);

	// Clear canvas
	ctx.clearRect(0, 0, size, size);

	// If no color stops, return empty canvas
	if (gradient.colorStops.length === 0) {
		return;
	}

	// Fill with average color as base to prevent transparency
	const baseColor = calculateAverageColor(gradient.colorStops);
	ctx.fillStyle = baseColor;
	ctx.fillRect(0, 0, size, size);

	// Use blend mode from gradient or default to lighter
	const blendMode = gradient.blendMode || "lighter";
	ctx.globalCompositeOperation = blendMode;

	// Draw each color stop as an elliptical gradient with rotation
	for (const stop of gradient.colorStops) {
		// Convert percentage positions to pixel positions
		const x = (stop.x / 100) * size;
		const y = (stop.y / 100) * size;
		const baseRadius = (stop.intensity / 100) * size;

		// Apply elliptical distortion
		const radiusX = baseRadius * stop.scaleX;
		const radiusY = baseRadius * stop.scaleY;

		// Parse the hex color to RGB for intensity control
		const r = Number.parseInt(stop.color.slice(1, 3), 16);
		const g = Number.parseInt(stop.color.slice(3, 5), 16);
		const b = Number.parseInt(stop.color.slice(5, 7), 16);

		// Save context state
		ctx.save();

		// Translate to the center point and rotate
		ctx.translate(x, y);
		ctx.rotate((stop.rotation * Math.PI) / 180);

		// Scale to create ellipse effect
		ctx.scale(radiusX / baseRadius, radiusY / baseRadius);

		// Create radial gradient (will be transformed into ellipse)
		const radialGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius);

		// Add color stops with opacity for smooth blending
		radialGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
		radialGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.3)`);
		radialGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

		// Fill with transformed gradient
		ctx.fillStyle = radialGradient;
		ctx.fillRect(-size, -size, size * 2, size * 2);

		// Restore context state
		ctx.restore();
	}

	// Reset composite operation
	ctx.globalCompositeOperation = "source-over";
}

/**
 * Apply circular mask to canvas with transparent background
 */
export function applyCircularMask(canvas: HTMLCanvasElement) {
	const ctx = getContext(canvas);
	const size = canvas.width;
	const centerX = size / 2;
	const centerY = size / 2;
	const radius = size / 2;

	// Create a new canvas to hold the masked result
	const tempCanvas = document.createElement("canvas");
	tempCanvas.width = size;
	tempCanvas.height = size;
	const tempCtx = getContext(tempCanvas);

	// Copy the original canvas content to temp canvas
	tempCtx.drawImage(canvas, 0, 0);

	// Clear the original canvas
	ctx.clearRect(0, 0, size, size);

	// Set up circular clipping path
	ctx.save();
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();

	// Draw the temp canvas back (now clipped to circle)
	ctx.drawImage(tempCanvas, 0, 0);
	ctx.restore();
}

/**
 * Export canvas as PNG blob
 */
export async function exportCanvasToPNG(
	canvas: HTMLCanvasElement,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Failed to create blob from canvas"));
				}
			},
			"image/png",
			1.0,
		);
	});
}

/**
 * Download canvas as PNG file
 */
export async function downloadCanvas(
	canvas: HTMLCanvasElement,
	filename: string,
) {
	const blob = await exportCanvasToPNG(canvas);
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;

	// Use event-based cleanup to prevent premature revocation
	// This ensures the download has started before revoking the URL
	const cleanup = () => {
		URL.revokeObjectURL(url);
		link.remove();
	};

	// Fallback timeout in case click doesn't trigger properly
	const timeoutId = setTimeout(cleanup, 5000);

	// Try to cleanup immediately after download starts (Safari/Chrome support this)
	link.addEventListener(
		"click",
		() => {
			// Give browser time to start download before cleanup
			setTimeout(() => {
				clearTimeout(timeoutId);
				cleanup();
			}, 1000);
		},
		{ once: true },
	);

	link.click();
}

/**
 * Generate a filename for a gradient export
 */
export function generateGradientFilename(
	gradient: Gradient,
	size: number,
): string {
	const timestamp = new Date().toISOString().split("T")[0];
	const colorStr = gradient.colorStops
		.map((stop) => stop.color.replace("#", ""))
		.join("-");
	return `gradient-mesh-${colorStr.slice(0, 20)}-${size}px-${timestamp}.png`;
}
