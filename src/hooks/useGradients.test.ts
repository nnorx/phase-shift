import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	areGradientsEqual,
	encodeGradients,
	filterNewGradients,
} from "@/lib/gradient-serialization";
import type { Gradient } from "@/types/gradient";
import { useGradients } from "./useGradients";

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
		info: vi.fn(),
	},
}));

// Mock navigator.clipboard
Object.assign(navigator, {
	clipboard: {
		writeText: vi.fn().mockResolvedValue(undefined),
	},
});

describe("useGradients", () => {
	// Store original console.error
	const originalConsoleError = console.error;

	beforeEach(() => {
		localStorage.clear();
		window.history.replaceState({}, "", window.location.pathname);
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
		// Restore console.error after each test
		console.error = originalConsoleError;
	});

	describe("initialization", () => {
		it("should initialize with empty gradients", async () => {
			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			expect(result.current.gradients).toEqual([]);
		});

		it("should load gradients from localStorage", async () => {
			const savedGradients: Gradient[] = [
				{
					id: "test-1",
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
				},
			];
			localStorage.setItem(
				"phase-shift-gradients",
				JSON.stringify(savedGradients),
			);

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			expect(result.current.gradients).toHaveLength(1);
			expect(result.current.gradients[0]?.id).toBe("test-1");
		});

		it("should handle invalid localStorage data gracefully", async () => {
			// Mock console.error to suppress expected error message
			console.error = vi.fn();

			localStorage.setItem("phase-shift-gradients", "invalid-json");

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			expect(result.current.gradients).toEqual([]);
			expect(console.error).toHaveBeenCalledWith(
				"Failed to load gradients from localStorage:",
				expect.any(Error),
			);
		});
	});

	describe("URL import", () => {
		it("should show import dialog when URL has valid gradients", async () => {
			const gradients: Gradient[] = [
				{
					id: "test-1",
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
				},
			];
			const encoded = encodeGradients(gradients);
			window.history.replaceState({}, "", `?gradients=${encoded}`);

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			expect(result.current.pendingImport).not.toBeNull();
			expect(result.current.pendingImport?.show).toBe(true);
			expect(result.current.pendingImport?.gradients).toHaveLength(1);
		});

		it("should reject oversized URL payloads", async () => {
			// Create a payload that's too large (> 50KB)
			const largePayload = "x".repeat(51000);
			window.history.replaceState({}, "", `?gradients=${largePayload}`);

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			expect(result.current.pendingImport).toBeNull();
		});

		it("should reject invalid encoded gradients", async () => {
			// Mock console.error to suppress expected error message
			console.error = vi.fn();

			window.history.replaceState({}, "", "?gradients=invalid-data");

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			expect(result.current.pendingImport).toBeNull();
			expect(console.error).toHaveBeenCalled();
		});
	});

	describe("addGradient", () => {
		it("should add a new gradient", async () => {
			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			let gradient!: ReturnType<typeof result.current.addGradient>;
			act(() => {
				gradient = result.current.addGradient({
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
					blendMode: "multiply",
				});
			});

			expect(gradient).toBeDefined();
			if (!gradient) throw new Error("gradient is undefined");
			expect(gradient.id).toBeDefined();
			expect(gradient.blendMode).toBe("multiply");

			await waitFor(() => {
				expect(result.current.gradients).toHaveLength(1);
			});
		});

		it("should add new gradients to the beginning", async () => {
			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			let gradient1!: ReturnType<typeof result.current.addGradient>;
			let gradient2!: ReturnType<typeof result.current.addGradient>;

			act(() => {
				gradient1 = result.current.addGradient({
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
				});
			});

			act(() => {
				gradient2 = result.current.addGradient({
					colorStops: [
						{
							color: "#00ff00",
							x: 50,
							y: 50,
							intensity: 60,
							scaleX: 1,
							scaleY: 1,
							rotation: 0,
						},
					],
				});
			});

			await waitFor(() => {
				expect(result.current.gradients).toHaveLength(2);
			});

			if (!gradient2 || !gradient1) throw new Error("gradients are undefined");
			expect(result.current.gradients[0]?.id).toBe(gradient2.id);
			expect(result.current.gradients[1]?.id).toBe(gradient1.id);
		});
	});

	describe("updateGradient", () => {
		it("should update an existing gradient", async () => {
			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			let gradient!: ReturnType<typeof result.current.addGradient>;
			act(() => {
				gradient = result.current.addGradient({
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
				});
			});

			if (!gradient) throw new Error("gradient is undefined");
			act(() => {
				result.current.updateGradient(gradient.id, {
					blendMode: "multiply",
				});
			});

			await waitFor(() => {
				expect(result.current.gradients[0]?.blendMode).toBe("multiply");
			});
		});
	});

	describe("deleteGradient", () => {
		it("should delete a gradient", async () => {
			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			let gradient!: ReturnType<typeof result.current.addGradient>;
			act(() => {
				gradient = result.current.addGradient({
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
				});
			});

			await waitFor(() => {
				expect(result.current.gradients).toHaveLength(1);
			});

			if (!gradient) throw new Error("gradient is undefined");
			act(() => {
				result.current.deleteGradient(gradient.id);
			});

			await waitFor(() => {
				expect(result.current.gradients).toHaveLength(0);
			});
		});
	});

	describe("generateShareUrl", () => {
		it("should generate a valid share URL", async () => {
			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			act(() => {
				result.current.addGradient({
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
				});
			});

			await waitFor(() => {
				expect(result.current.gradients).toHaveLength(1);
			});

			const url = result.current.generateShareUrl();
			expect(url).toContain("gradients=");
		});

		it("should return null for URLs exceeding length limit", async () => {
			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			// Add many gradients with long color stops to exceed URL length
			act(() => {
				for (let i = 0; i < 150; i++) {
					result.current.addGradient({
						colorStops: Array.from({ length: 20 }, (_, j) => ({
							color: `#${j.toString().repeat(6).slice(0, 6)}`,
							x: 50,
							y: 50,
							intensity: 60,
							scaleX: 1,
							scaleY: 1,
							rotation: 0,
						})),
					});
				}
			});

			await waitFor(() => {
				expect(result.current.gradients.length).toBeGreaterThan(100);
			});

			const url = result.current.generateShareUrl();
			expect(url).toBeNull();
		});
	});

	describe("copyShareUrl", () => {
		it("should copy share URL to clipboard", async () => {
			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			act(() => {
				result.current.addGradient({
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
				});
			});

			await waitFor(() => {
				expect(result.current.gradients).toHaveLength(1);
			});

			const success = await result.current.copyShareUrl();
			expect(success).toBe(true);
			expect(navigator.clipboard.writeText).toHaveBeenCalled();
		});

		it("should handle clipboard errors", async () => {
			// Mock console.error to suppress expected error message
			console.error = vi.fn();

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			act(() => {
				result.current.addGradient({
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
				});
			});

			await waitFor(() => {
				expect(result.current.gradients).toHaveLength(1);
			});

			// Mock clipboard failure
			vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
				new Error("Permission denied"),
			);

			const success = await result.current.copyShareUrl();
			expect(success).toBe(false);
			expect(console.error).toHaveBeenCalledWith(
				"Failed to copy URL to clipboard:",
				expect.any(Error),
			);
		});
	});

	describe("gradient comparison", () => {
		const baseGradient: Gradient = {
			id: "test-1",
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

		it("should identify identical gradients with different IDs", () => {
			const gradient1 = { ...baseGradient, id: "id-1", createdAt: 1000 };
			const gradient2 = { ...baseGradient, id: "id-2", createdAt: 2000 };

			expect(areGradientsEqual(gradient1, gradient2)).toBe(true);
		});

		it("should identify gradients with different colors as different", () => {
			const gradient1 = { ...baseGradient };
			const firstStop = baseGradient.colorStops[0];
			if (!firstStop) throw new Error("firstStop is undefined");
			const gradient2 = {
				...baseGradient,
				colorStops: [{ ...firstStop, color: "#00ff00" }],
			};

			expect(areGradientsEqual(gradient1, gradient2)).toBe(false);
		});

		it("should identify gradients with different blend modes as different", () => {
			const gradient1 = { ...baseGradient, blendMode: "lighter" as const };
			const gradient2 = { ...baseGradient, blendMode: "multiply" as const };

			expect(areGradientsEqual(gradient1, gradient2)).toBe(false);
		});

		it("should handle rounding differences (50.001 vs 50.00)", () => {
			const gradient1 = { ...baseGradient };
			const firstStop = baseGradient.colorStops[0];
			if (!firstStop) throw new Error("firstStop is undefined");
			const gradient2 = {
				...baseGradient,
				colorStops: [{ ...firstStop, x: 50.001 }],
			};

			// Should be equal because values are rounded to 2 decimals
			expect(areGradientsEqual(gradient1, gradient2)).toBe(true);
		});

		it("should identify gradients with different number of colorStops", () => {
			const gradient1 = { ...baseGradient };
			const gradient2 = {
				...baseGradient,
				colorStops: [
					...baseGradient.colorStops,
					{
						color: "#00ff00",
						x: 30,
						y: 30,
						intensity: 60,
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
					},
				],
			};

			expect(areGradientsEqual(gradient1, gradient2)).toBe(false);
		});

		it("should treat undefined blendMode as 'lighter'", () => {
			const gradient1 = { ...baseGradient, blendMode: "lighter" as const };
			const gradient2 = { ...baseGradient, blendMode: undefined };

			expect(areGradientsEqual(gradient1, gradient2)).toBe(true);
		});
	});

	describe("filter new gradients", () => {
		it("should filter out duplicate gradients", () => {
			const existing: Gradient[] = [
				{
					id: "existing-1",
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
				},
			];

			const imported: Gradient[] = [
				{
					id: "new-1",
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
				},
			];

			const result = filterNewGradients(imported, existing);
			expect(result).toHaveLength(0);
		});

		it("should keep new gradients", () => {
			const existing: Gradient[] = [
				{
					id: "existing-1",
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
				},
			];

			const imported: Gradient[] = [
				{
					id: "new-1",
					colorStops: [
						{
							color: "#00ff00", // Different color
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
				},
			];

			const result = filterNewGradients(imported, existing);
			expect(result).toHaveLength(1);
			expect(result[0]?.id).toBe("new-1");
		});

		it("should handle mix of new and duplicate gradients", () => {
			const existing: Gradient[] = [
				{
					id: "existing-1",
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
				},
			];

			const imported: Gradient[] = [
				{
					id: "new-1",
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
				},
				{
					id: "new-2",
					colorStops: [
						{
							color: "#00ff00",
							x: 30,
							y: 30,
							intensity: 70,
							scaleX: 1.5,
							scaleY: 1.5,
							rotation: 45,
						},
					],
					blendMode: "multiply",
					createdAt: Date.now(),
				},
			];

			const result = filterNewGradients(imported, existing);
			expect(result).toHaveLength(1);
			expect(result[0]?.id).toBe("new-2");
		});
	});

	describe("URL import with duplicate detection", () => {
		it("should not show import dialog when all gradients are duplicates", async () => {
			const existingGradients: Gradient[] = [
				{
					id: "existing",
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
				},
			];
			localStorage.setItem(
				"phase-shift-gradients",
				JSON.stringify(existingGradients),
			);

			// Import the same gradient
			const encoded = encodeGradients(existingGradients);
			window.history.replaceState({}, "", `?gradients=${encoded}`);

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			// Import dialog should NOT be shown
			expect(result.current.pendingImport).toBeNull();

			// Should still have the original gradient
			expect(result.current.gradients).toHaveLength(1);
			expect(result.current.gradients[0]?.id).toBe("existing");
		});

		it("should show import dialog only for new gradients when mix exists", async () => {
			const existingGradients: Gradient[] = [
				{
					id: "existing",
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
				},
			];
			localStorage.setItem(
				"phase-shift-gradients",
				JSON.stringify(existingGradients),
			);

			// Import one duplicate and one new
			const toImport: Gradient[] = [
				...existingGradients,
				{
					id: "new",
					colorStops: [
						{
							color: "#00ff00",
							x: 30,
							y: 30,
							intensity: 70,
							scaleX: 1.5,
							scaleY: 1.5,
							rotation: 45,
						},
					],
					blendMode: "multiply",
					createdAt: Date.now(),
				},
			];
			const encoded = encodeGradients(toImport);
			window.history.replaceState({}, "", `?gradients=${encoded}`);

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.isInitialized).toBe(true);
			});

			// Import dialog SHOULD be shown with only the new gradient
			expect(result.current.pendingImport).not.toBeNull();
			expect(result.current.pendingImport?.gradients).toHaveLength(1);
			expect(
				result.current.pendingImport?.gradients[0]?.colorStops[0]?.color,
			).toBe("#00ff00");
		});
	});

	describe("import handlers", () => {
		it("should merge imported gradients", async () => {
			const existingGradients: Gradient[] = [
				{
					id: "existing",
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
				},
			];
			localStorage.setItem(
				"phase-shift-gradients",
				JSON.stringify(existingGradients),
			);

			const newGradients: Gradient[] = [
				{
					id: "new",
					colorStops: [
						{
							color: "#00ff00",
							x: 50,
							y: 50,
							intensity: 60,
							scaleX: 1,
							scaleY: 1,
							rotation: 0,
						},
					],
					blendMode: "multiply",
					createdAt: Date.now(),
				},
			];
			const encoded = encodeGradients(newGradients);
			window.history.replaceState({}, "", `?gradients=${encoded}`);

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.pendingImport).not.toBeNull();
			});

			act(() => {
				result.current.handleImportMerge();
			});

			await waitFor(() => {
				expect(result.current.gradients).toHaveLength(2);
			});

			expect(result.current.pendingImport).toBeNull();
		});

		it("should replace all gradients on import", async () => {
			const existingGradients: Gradient[] = [
				{
					id: "existing",
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
				},
			];
			localStorage.setItem(
				"phase-shift-gradients",
				JSON.stringify(existingGradients),
			);

			const newGradients: Gradient[] = [
				{
					id: "new",
					colorStops: [
						{
							color: "#00ff00",
							x: 50,
							y: 50,
							intensity: 60,
							scaleX: 1,
							scaleY: 1,
							rotation: 0,
						},
					],
					blendMode: "multiply",
					createdAt: Date.now(),
				},
			];
			const encoded = encodeGradients(newGradients);
			window.history.replaceState({}, "", `?gradients=${encoded}`);

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.pendingImport).not.toBeNull();
			});

			act(() => {
				result.current.handleImportReplace();
			});

			await waitFor(() => {
				expect(result.current.gradients).toHaveLength(1);
				expect(result.current.gradients[0]?.colorStops[0]?.color).toBe(
					"#00ff00",
				);
			});

			expect(result.current.pendingImport).toBeNull();
		});

		it("should ignore imported gradients", async () => {
			const existingGradients: Gradient[] = [
				{
					id: "existing",
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
				},
			];
			localStorage.setItem(
				"phase-shift-gradients",
				JSON.stringify(existingGradients),
			);

			const newGradients: Gradient[] = [
				{
					id: "new",
					colorStops: [
						{
							color: "#00ff00",
							x: 50,
							y: 50,
							intensity: 60,
							scaleX: 1,
							scaleY: 1,
							rotation: 0,
						},
					],
					blendMode: "multiply",
					createdAt: Date.now(),
				},
			];
			const encoded = encodeGradients(newGradients);
			window.history.replaceState({}, "", `?gradients=${encoded}`);

			const { result } = renderHook(() => useGradients());

			await waitFor(() => {
				expect(result.current.pendingImport).not.toBeNull();
			});

			act(() => {
				result.current.handleImportIgnore();
			});

			await waitFor(() => {
				expect(result.current.pendingImport).toBeNull();
			});

			expect(result.current.gradients).toHaveLength(1);
			expect(result.current.gradients[0]?.id).toBe("existing");
		});
	});
});
