import { memo, useEffect, useMemo, useRef } from "react";
import { drawGradient } from "@/lib/canvas-gradients";
import type { Gradient } from "@/types/gradient";

interface CanvasRendererProps {
	gradient: Gradient;
	size?: number;
	className?: string;
}

function CanvasRendererComponent({
	gradient,
	size = 512,
	className = "",
}: CanvasRendererProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Memoize gradient serialization to prevent unnecessary redraws
	// Only redraw when actual gradient properties change, not reference
	const gradientKey = useMemo(() => {
		return JSON.stringify({
			colorStops: gradient.colorStops.map((stop) => ({
				color: stop.color,
				x: Math.round(stop.x * 100) / 100,
				y: Math.round(stop.y * 100) / 100,
				intensity: stop.intensity,
				scaleX: Math.round((stop.scaleX || 1) * 100) / 100,
				scaleY: Math.round((stop.scaleY || 1) * 100) / 100,
				rotation: Math.round((stop.rotation || 0) * 100) / 100,
			})),
			blendMode: gradient.blendMode,
		});
	}, [gradient.colorStops, gradient.blendMode]);

	// Store previous gradientKey to avoid unnecessary redraws
	const prevGradientKeyRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (canvasRef.current && prevGradientKeyRef.current !== gradientKey) {
			drawGradient(canvasRef.current, gradient, size);
			prevGradientKeyRef.current = gradientKey;
		}
	}, [gradient, gradientKey, size]);

	return (
		<canvas
			ref={canvasRef}
			width={size}
			height={size}
			className={className}
			style={{
				width: "100%",
				height: "auto",
				imageRendering: "auto",
			}}
		/>
	);
}

// Memoize component to prevent re-renders when parent re-renders
// but gradient props haven't changed
export const CanvasRenderer = memo(CanvasRendererComponent);
