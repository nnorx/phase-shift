import { useThrottledCallback } from "@tanstack/react-pacer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawGradient } from "@/lib/canvas-gradients";
import type { ColorStop, Gradient } from "@/types/gradient";

interface InteractiveMeshCanvasProps {
	gradient: Gradient;
	onColorStopUpdate: (index: number, updates: Partial<ColorStop>) => void;
	className?: string;
	size?: number;
}

export function InteractiveMeshCanvas({
	gradient,
	onColorStopUpdate,
	className = "",
	size = 512,
}: InteractiveMeshCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
	const [canvasSize, setCanvasSize] = useState({ width: size, height: size });

	// Update canvas size to match container
	useEffect(() => {
		const updateSize = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				const displaySize = Math.min(rect.width, rect.height);
				setCanvasSize({ width: displaySize, height: displaySize });
			}
		};

		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	// Memoize gradient serialization to prevent unnecessary redraws
	// Only redraw when actual gradient properties change
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

	// Redraw gradient when it actually changes
	useEffect(() => {
		if (canvasRef.current && prevGradientKeyRef.current !== gradientKey) {
			drawGradient(canvasRef.current, gradient, size);
			prevGradientKeyRef.current = gradientKey;
		}
	}, [gradient, gradientKey, size]);

	const getPositionFromEvent = useCallback(
		(clientX: number, clientY: number): { x: number; y: number } | null => {
			if (!containerRef.current) return null;

			const rect = containerRef.current.getBoundingClientRect();
			const x = ((clientX - rect.left) / rect.width) * 100;
			const y = ((clientY - rect.top) / rect.height) * 100;

			return { x, y };
		},
		[],
	);

	const handleStart = (clientX: number, clientY: number) => {
		const position = getPositionFromEvent(clientX, clientY);
		if (!position) return;

		// Find closest color stop (within 15% distance)
		let closestIndex = -1;
		let closestDistance = 15;

		gradient.colorStops.forEach((stop, index) => {
			const distance = Math.sqrt(
				(stop.x - position.x) ** 2 + (stop.y - position.y) ** 2,
			);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		if (closestIndex !== -1) {
			setDraggingIndex(closestIndex);
		}
	};

	// Throttle the position update to reduce re-renders during drag
	// 16ms = ~60fps, provides smooth visual feedback without excessive updates
	const throttledUpdate = useThrottledCallback(
		(index: number, x: number, y: number) => {
			onColorStopUpdate(index, { x, y });
		},
		{ wait: 16 },
	);

	const handleMove = useCallback(
		(clientX: number, clientY: number) => {
			if (draggingIndex === null) return;

			const position = getPositionFromEvent(clientX, clientY);
			if (!position) return;

			const x = Math.max(0, Math.min(100, position.x));
			const y = Math.max(0, Math.min(100, position.y));

			throttledUpdate(draggingIndex, x, y);
		},
		[draggingIndex, throttledUpdate, getPositionFromEvent],
	);

	const handleEnd = () => {
		setDraggingIndex(null);
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		handleStart(e.clientX, e.clientY);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		handleMove(e.clientX, e.clientY);
	};

	const handleMouseUp = () => {
		handleEnd();
	};

	const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			if (touch) {
				handleStart(touch.clientX, touch.clientY);
			}
		}
	};

	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		if (e.touches.length === 1 && draggingIndex !== null) {
			// Only prevent scrolling when actively dragging a marker
			e.preventDefault();
			const touch = e.touches[0];
			if (touch) {
				handleMove(touch.clientX, touch.clientY);
			}
		}
	};

	const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
		if (draggingIndex !== null) {
			e.preventDefault();
		}
		handleEnd();
	};

	return (
		<div
			ref={containerRef}
			className={`relative h-full w-full ${className}`}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchEnd}
			style={{
				cursor: draggingIndex !== null ? "grabbing" : "grab",
				touchAction: "none",
			}}
			role="application"
			aria-label="Interactive mesh gradient canvas - drag color markers to reposition"
		>
			{/* Canvas */}
			<canvas
				ref={canvasRef}
				width={size}
				height={size}
				style={{
					width: canvasSize.width,
					height: canvasSize.height,
					imageRendering: "auto",
				}}
				className="rounded-lg"
			/>

			{/* Color stop markers */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					width: canvasSize.width,
					height: canvasSize.height,
				}}
			>
				{gradient.colorStops.map((stop, index) => (
					<div
						key={`${stop.color}-${stop.x}-${stop.y}-${index}`}
						className="absolute -translate-x-1/2 -translate-y-1/2"
						style={{
							left: `${stop.x}%`,
							top: `${stop.y}%`,
						}}
					>
						{/* Outer ring */}
						<div
							className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background shadow-lg transition-all ${
								draggingIndex === index
									? "scale-125 border-foreground"
									: "border-border"
							}`}
						>
							{/* Color dot */}
							<div
								className="h-5 w-5 rounded-full border border-border"
								style={{ backgroundColor: stop.color }}
							/>
						</div>
						{/* Index label */}
						<div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 font-mono text-[10px] shadow-sm">
							{index + 1}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
