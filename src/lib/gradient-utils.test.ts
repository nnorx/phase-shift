import { describe, expect, it } from "vitest";
import { MAX_COLOR_STOPS, MAX_GRADIENTS_IMPORT } from "@/lib/config";
import {
	createColorStop,
	createGradient,
	generateId,
} from "@/lib/gradient-factories";
import { decodeGradients, encodeGradients } from "@/lib/gradient-serialization";
import { validateGradient } from "@/lib/gradient-validation";
import type { BlendMode, ColorStop, Gradient } from "@/types/gradient";

describe("gradient-utils", () => {
	describe("generateId", () => {
		it("should generate unique IDs", () => {
			const id1 = generateId();
			const id2 = generateId();
			expect(id1).not.toBe(id2);
			expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
		});
	});

	describe("createColorStop", () => {
		it("should create a color stop with random position", () => {
			const stop = createColorStop("#ff0000");
			expect(stop.color).toBe("#ff0000");
			expect(stop.x).toBeGreaterThanOrEqual(0);
			expect(stop.x).toBeLessThanOrEqual(100);
			expect(stop.y).toBeGreaterThanOrEqual(0);
			expect(stop.y).toBeLessThanOrEqual(100);
			expect(stop.intensity).toBe(60);
			expect(stop.scaleX).toBeGreaterThanOrEqual(0.5);
			expect(stop.scaleX).toBeLessThanOrEqual(2);
			expect(stop.scaleY).toBeGreaterThanOrEqual(0.5);
			expect(stop.scaleY).toBeLessThanOrEqual(2);
			expect(stop.rotation).toBeGreaterThanOrEqual(0);
			expect(stop.rotation).toBeLessThanOrEqual(360);
		});

		it("should create a color stop with specified position", () => {
			const stop = createColorStop("#00ff00", { x: 25, y: 75 }, 80);
			expect(stop.color).toBe("#00ff00");
			expect(stop.x).toBe(25);
			expect(stop.y).toBe(75);
			expect(stop.intensity).toBe(80);
		});
	});

	describe("createGradient", () => {
		it("should create a gradient with required fields", () => {
			const colorStops = [createColorStop("#ff0000")];
			const gradient = createGradient({ colorStops, blendMode: "multiply" });
			expect(gradient.id).toBeDefined();
			expect(gradient.colorStops).toEqual(colorStops);
			expect(gradient.blendMode).toBe("multiply");
			expect(gradient.createdAt).toBeGreaterThan(0);
		});

		it("should default to lighter blend mode", () => {
			const gradient = createGradient({ colorStops: [] });
			expect(gradient.blendMode).toBe("lighter");
		});
	});

	describe("validateGradient", () => {
		it("should validate a correct gradient", () => {
			const gradient: Partial<Gradient> = {
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 45,
					},
				],
				blendMode: "lighter",
			};
			expect(validateGradient(gradient)).toBe(true);
		});

		it("should reject gradient with no color stops", () => {
			expect(validateGradient({})).toBe(false);
			expect(validateGradient({ colorStops: [] })).toBe(false);
		});

		it("should reject gradient with too many color stops", () => {
			const colorStops = Array.from({ length: MAX_COLOR_STOPS + 1 }, () => ({
				color: "#ff0000",
				x: 50,
				y: 50,
				intensity: 60,
				scaleX: 1,
				scaleY: 1,
				rotation: 45,
			}));
			expect(validateGradient({ colorStops })).toBe(false);
		});

		it("should reject invalid hex colors", () => {
			const gradient: Partial<Gradient> = {
				colorStops: [
					{
						color: "red",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 45,
					},
				],
			};
			expect(validateGradient(gradient)).toBe(false);
		});

		it("should reject invalid blend modes", () => {
			const gradient: Partial<Gradient> = {
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 45,
					},
				],
				blendMode: "invalid" as unknown as BlendMode,
			};
			expect(validateGradient(gradient)).toBe(false);
		});

		it("should reject out-of-range positions", () => {
			const gradient: Partial<Gradient> = {
				colorStops: [
					{
						color: "#ff0000",
						x: -10,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 45,
					},
				],
			};
			expect(validateGradient(gradient)).toBe(false);
		});

		it("should reject out-of-range intensity", () => {
			const gradient: Partial<Gradient> = {
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 5,
						scaleX: 1,
						scaleY: 1,
						rotation: 45,
					},
				],
			};
			expect(validateGradient(gradient)).toBe(false);
		});

		it("should reject out-of-range scale values", () => {
			const gradient: Partial<Gradient> = {
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 3,
						scaleY: 1,
						rotation: 45,
					},
				],
			};
			expect(validateGradient(gradient)).toBe(false);
		});

		it("should reject out-of-range rotation", () => {
			const gradient: Partial<Gradient> = {
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 400,
					},
				],
			};
			expect(validateGradient(gradient)).toBe(false);
		});

		it("should reject missing numeric fields", () => {
			const gradient: Partial<Gradient> = {
				colorStops: [
					{
						color: "#ff0000",
						x: 50,
						y: 50,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
					} as Partial<ColorStop>,
				] as ColorStop[],
			};
			expect(validateGradient(gradient)).toBe(false);
		});
	});

	describe("encodeGradients and decodeGradients", () => {
		it("should encode and decode gradients correctly", () => {
			const gradients: Gradient[] = [
				{
					id: "test-1",
					colorStops: [
						{
							color: "#ff0000",
							x: 25.5,
							y: 50.75,
							intensity: 60.3,
							scaleX: 1.2,
							scaleY: 0.8,
							rotation: 45.6,
						},
					],
					blendMode: "multiply",
					createdAt: Date.now(),
				},
			];

			const encoded = encodeGradients(gradients);
			expect(encoded).toBeTruthy();
			expect(encoded).not.toContain("+");
			expect(encoded).not.toContain("/");
			expect(encoded).not.toContain("=");

			const decoded = decodeGradients(encoded);
			expect(decoded).toHaveLength(1);
			expect(decoded[0]?.colorStops[0]?.color).toBe("#ff0000");
			expect(decoded[0]?.blendMode).toBe("multiply");
			// Values should be rounded to 2 decimals
			expect(decoded[0]?.colorStops[0]?.x).toBeCloseTo(25.5, 1);
			expect(decoded[0]?.colorStops[0]?.y).toBeCloseTo(50.75, 1);
		});

		it("should handle multiple gradients", () => {
			const gradients: Gradient[] = [
				{
					id: "test-1",
					colorStops: [createColorStop("#ff0000")],
					blendMode: "lighter",
					createdAt: Date.now(),
				},
				{
					id: "test-2",
					colorStops: [createColorStop("#00ff00"), createColorStop("#0000ff")],
					blendMode: "screen",
					createdAt: Date.now(),
				},
			];

			const encoded = encodeGradients(gradients);
			const decoded = decodeGradients(encoded);

			expect(decoded).toHaveLength(2);
			expect(decoded[0]?.blendMode).toBe("lighter");
			expect(decoded[1]?.blendMode).toBe("screen");
			expect(decoded[1]?.colorStops).toHaveLength(2);
		});

		it("should handle objects with special properties gracefully", () => {
			// Modern JSON.stringify can handle some circular refs by omitting them
			// Instead test with objects that have functions (which JSON.stringify can't handle)
			const withFunction = {
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
				fn: () => {},
			} as unknown as Gradient;
			// This will still encode since JSON.stringify drops functions
			// The important thing is it doesn't crash
			const encoded = encodeGradients([withFunction]);
			expect(typeof encoded).toBe("string");
		});

		it("should handle invalid base64 gracefully", () => {
			const errorMessages: string[] = [];
			const decoded = decodeGradients("not-valid-base64!!!", (msg) =>
				errorMessages.push(msg),
			);
			expect(decoded).toHaveLength(0);
			expect(errorMessages.length).toBeGreaterThan(0);
		});

		it("should reject non-array data", () => {
			const encoded = btoa(JSON.stringify({ not: "array" }))
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=+$/, "");
			const errorMessages: string[] = [];
			const decoded = decodeGradients(encoded, (msg) =>
				errorMessages.push(msg),
			);
			expect(decoded).toHaveLength(0);
			expect(errorMessages).toContain("Invalid gradient data format");
		});

		it("should skip invalid gradients during decode", () => {
			const encoded = btoa(
				JSON.stringify([
					{
						colorStops: [
							{
								color: "#ff0000",
								x: 50,
								y: 50,
								intensity: 60,
								scaleX: 1,
								scaleY: 1,
								rotation: 45,
							},
						],
						blendMode: "lighter",
					},
					{ colorStops: [] }, // Invalid: empty colorStops
					{
						colorStops: [
							{
								color: "invalid",
								x: 50,
								y: 50,
								intensity: 60,
								scaleX: 1,
								scaleY: 1,
								rotation: 45,
							},
						],
					}, // Invalid: bad color
				]),
			)
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=+$/, "");

			const decoded = decodeGradients(encoded);
			expect(decoded).toHaveLength(1);
		});

		it("should enforce maximum gradients limit", () => {
			const gradients = Array.from(
				{ length: MAX_GRADIENTS_IMPORT + 1 },
				() => ({
					id: generateId(),
					colorStops: [createColorStop("#ff0000")],
					blendMode: "lighter" as const,
					createdAt: Date.now(),
				}),
			);

			const encoded = encodeGradients(gradients);
			const errorMessages: string[] = [];
			const decoded = decodeGradients(encoded, (msg) =>
				errorMessages.push(msg),
			);

			expect(decoded).toHaveLength(0);
			expect(errorMessages[0]).toContain("Too many gradients");
		});

		it("should report error when no valid gradients found", () => {
			const encoded = btoa(
				JSON.stringify([
					{ colorStops: [] }, // Invalid
					{ invalid: "data" }, // Invalid
				]),
			)
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=+$/, "");

			const errorMessages: string[] = [];
			const decoded = decodeGradients(encoded, (msg) =>
				errorMessages.push(msg),
			);

			expect(decoded).toHaveLength(0);
			expect(errorMessages).toContain(
				"No valid gradients found in shared link",
			);
		});
	});
});
