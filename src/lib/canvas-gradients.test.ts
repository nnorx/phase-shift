import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Gradient } from "@/types/gradient";
import {
	applyCircularMask,
	drawGradient,
	exportCanvasToPNG,
	generateGradientFilename,
} from "./canvas-gradients";

// Mock canvas context for jsdom
beforeEach(() => {
	// Mock getContext for canvas elements
	HTMLCanvasElement.prototype.getContext = vi.fn(
		(type: string): CanvasRenderingContext2D | null => {
			if (type === "2d") {
				return {
					clearRect: vi.fn(),
					fillRect: vi.fn(),
					save: vi.fn(),
					restore: vi.fn(),
					translate: vi.fn(),
					rotate: vi.fn(),
					scale: vi.fn(),
					createRadialGradient: vi.fn(() => ({
						addColorStop: vi.fn(),
					})),
					drawImage: vi.fn(),
					beginPath: vi.fn(),
					arc: vi.fn(),
					closePath: vi.fn(),
					clip: vi.fn(),
					fillStyle: "",
					globalCompositeOperation: "source-over",
				} as unknown as CanvasRenderingContext2D;
			}
			return null;
		},
	) as typeof HTMLCanvasElement.prototype.getContext;
});

describe("canvas-gradients", () => {
	describe("drawGradient", () => {
		it("should create canvas with correct dimensions", () => {
			const canvas = document.createElement("canvas");
			const gradient: Gradient = {
				id: "test",
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
					},
				],
				blendMode: "lighter",
				createdAt: Date.now(),
			};

			drawGradient(canvas, gradient, 512);

			expect(canvas.width).toBe(512);
			expect(canvas.height).toBe(512);
		});

		it("should handle empty color stops", () => {
			const canvas = document.createElement("canvas");
			const gradient: Gradient = {
				id: "test",
				colorStops: [],
				blendMode: "lighter",
				createdAt: Date.now(),
			};

			expect(() => drawGradient(canvas, gradient, 256)).not.toThrow();
			expect(canvas.width).toBe(256);
		});

		it("should use default blend mode if not specified", () => {
			const canvas = document.createElement("canvas");
			const gradient: Gradient = {
				id: "test",
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
					},
				],
				createdAt: Date.now(),
			};

			expect(() => drawGradient(canvas, gradient, 256)).not.toThrow();
		});

		it("should draw multiple color stops", () => {
			const canvas = document.createElement("canvas");
			const gradient: Gradient = {
				id: "test",
				colorStops: [
					{
						color: "#ff0000",
						x: 25,
						y: 25,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
					},
					{
						color: "#00ff00",
						x: 75,
						y: 75,
						intensity: 60,
						scaleX: 1.5,
						scaleY: 0.5,
						rotation: 45,
					},
				],
				blendMode: "multiply",
				createdAt: Date.now(),
			};

			expect(() => drawGradient(canvas, gradient, 512)).not.toThrow();
			expect(canvas.width).toBe(512);
			expect(canvas.height).toBe(512);
		});
	});

	describe("applyCircularMask", () => {
		it("should apply circular mask to canvas", () => {
			const canvas = document.createElement("canvas");
			const gradient: Gradient = {
				id: "test",
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
					},
				],
				blendMode: "lighter",
				createdAt: Date.now(),
			};

			drawGradient(canvas, gradient, 256);
			expect(() => applyCircularMask(canvas)).not.toThrow();
			expect(canvas.width).toBe(256);
			expect(canvas.height).toBe(256);
		});

		it("should work with empty canvas", () => {
			const canvas = document.createElement("canvas");
			canvas.width = 100;
			canvas.height = 100;

			expect(() => applyCircularMask(canvas)).not.toThrow();
		});
	});

	describe("exportCanvasToPNG", () => {
		it("should export canvas to PNG blob", async () => {
			const canvas = document.createElement("canvas");
			canvas.width = 100;
			canvas.height = 100;

			// Mock toBlob since jsdom doesn't implement it
			canvas.toBlob = vi.fn((callback) => {
				callback(new Blob(["test"], { type: "image/png" }));
			});

			const blob = await exportCanvasToPNG(canvas);
			expect(blob).toBeInstanceOf(Blob);
			expect(blob.type).toBe("image/png");
		});

		it("should reject if toBlob fails", async () => {
			const canvas = document.createElement("canvas");
			canvas.width = 100;
			canvas.height = 100;

			// Mock toBlob to fail
			canvas.toBlob = vi.fn((callback) => {
				callback(null);
			});

			await expect(exportCanvasToPNG(canvas)).rejects.toThrow(
				"Failed to create blob from canvas",
			);
		});
	});

	describe("generateGradientFilename", () => {
		it("should generate filename with gradient info", () => {
			const gradient: Gradient = {
				id: "test",
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
					},
					{
						color: "#00ff00",
						x: 25,
						y: 75,
						intensity: 80,
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
					},
				],
				blendMode: "lighter",
				createdAt: Date.now(),
			};

			const filename = generateGradientFilename(gradient, 512);
			expect(filename).toContain("gradient-mesh");
			expect(filename).toContain("512px");
			expect(filename).toContain(".png");
			expect(filename).toContain("ff0000-00ff00");
		});

		it("should truncate long color sequences", () => {
			const gradient: Gradient = {
				id: "test",
				colorStops: Array.from({ length: 10 }, (_, i) => ({
					color: `#${i.toString().repeat(6)}`,
					x: 50,
					y: 50,
					intensity: 60,
					scaleX: 1,
					scaleY: 1,
					rotation: 0,
				})),
				blendMode: "lighter",
				createdAt: Date.now(),
			};

			const filename = generateGradientFilename(gradient, 1024);
			// Color string should be truncated to 20 chars
			const parts = filename.split("-");
			const colorStr = parts
				.slice(2)
				.join("-")
				.replace("-1024px", "")
				.replace(/-.+\.png$/, "");
			expect(colorStr.length).toBeLessThanOrEqual(20);
		});

		it("should include current date", () => {
			const gradient: Gradient = {
				id: "test",
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
					},
				],
				blendMode: "lighter",
				createdAt: Date.now(),
			};

			const filename = generateGradientFilename(gradient, 256);
			const date = new Date().toISOString().split("T")[0];
			expect(filename).toContain(date);
		});
	});
});
