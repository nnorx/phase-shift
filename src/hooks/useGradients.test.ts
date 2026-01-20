import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encodeGradients } from "@/lib/gradient-serialization";
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
