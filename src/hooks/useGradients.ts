import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	MAX_ENCODED_SIZE,
	MAX_URL_LENGTH,
	STORAGE_KEY,
	URL_PARAM,
} from "@/lib/config";
import { createGradient } from "@/lib/gradient-factories";
import { decodeGradients, encodeGradients } from "@/lib/gradient-serialization";
import type { Gradient, GradientConfig } from "@/types/gradient";

/**
 * Custom hook for managing gradient state with localStorage and URL persistence
 */
export function useGradients() {
	const [gradients, setGradients] = useState<Gradient[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);
	const [pendingImport, setPendingImport] = useState<{
		gradients: Gradient[];
		show: boolean;
	} | null>(null);

	// Initialize gradients from localStorage first
	useEffect(() => {
		// Check for URL params
		const urlParams = new URLSearchParams(window.location.search);
		const encodedGradients = urlParams.get(URL_PARAM);

		// Load existing gradients from localStorage
		let existingGradients: Gradient[] = [];
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				existingGradients = JSON.parse(stored) as Gradient[];
				setGradients(existingGradients);
			}
		} catch (error) {
			console.error("Failed to load gradients from localStorage:", error);
		}

		// If URL has gradients, prepare to show import dialog
		if (encodedGradients) {
			// Security check: Validate payload size to prevent DoS attacks
			if (encodedGradients.length > MAX_ENCODED_SIZE) {
				toast.error("Share link too large", {
					description:
						"This link contains too much data to load safely. Maximum 100 gradients allowed.",
				});
				window.history.replaceState({}, "", window.location.pathname);
				setIsInitialized(true);
				return;
			}

			const decoded = decodeGradients(encodedGradients, (errorMessage) => {
				toast.error("Failed to load gradients", {
					description: errorMessage,
				});
			});
			if (decoded.length > 0) {
				setPendingImport({
					gradients: decoded,
					show: true,
				});
				setIsInitialized(true);
				return;
			}
		}

		setIsInitialized(true);
	}, []);

	// Debounce localStorage saves to prevent excessive writes during rapid updates
	// Save immediately on first render, then debounce subsequent saves
	const saveToLocalStorage = useDebouncedCallback(
		(gradientsToSave: Gradient[]) => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(gradientsToSave));
		},
		{ wait: 500 }, // Wait 500ms after last change before saving
	);

	// Track if this is the first save to avoid debouncing initial state
	const isFirstSaveRef = useRef(true);

	// Save to localStorage whenever gradients change
	useEffect(() => {
		if (isInitialized) {
			// Save immediately on first update (e.g., when loading from URL)
			if (isFirstSaveRef.current) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(gradients));
				isFirstSaveRef.current = false;
			} else {
				// Debounce subsequent saves
				saveToLocalStorage(gradients);
			}
		}
	}, [gradients, isInitialized, saveToLocalStorage]);

	/**
	 * Add a new gradient
	 */
	const addGradient = useCallback((config: GradientConfig) => {
		const newGradient = createGradient(config);
		setGradients((prev) => [newGradient, ...prev]);
		return newGradient;
	}, []);

	/**
	 * Update an existing gradient
	 */
	const updateGradient = useCallback(
		(id: string, updates: Partial<Gradient>) => {
			setGradients((prev) =>
				prev.map((g) => (g.id === id ? { ...g, ...updates } : g)),
			);
		},
		[],
	);

	/**
	 * Delete a gradient
	 */
	const deleteGradient = useCallback((id: string) => {
		setGradients((prev) => prev.filter((g) => g.id !== id));
	}, []);

	/**
	 * Clear all gradients
	 */
	const clearGradients = useCallback(() => {
		setGradients([]);
	}, []);

	/**
	 * Generate shareable URL with all gradients encoded
	 */
	const generateShareUrl = useCallback(() => {
		if (gradients.length === 0) {
			return window.location.origin + window.location.pathname;
		}

		const encoded = encodeGradients(gradients);
		const url = new URL(window.location.href);
		url.searchParams.set(URL_PARAM, encoded);
		const finalUrl = url.toString();

		// Validate URL length doesn't exceed browser limits
		if (finalUrl.length > MAX_URL_LENGTH) {
			return null;
		}

		return finalUrl;
	}, [gradients]);

	/**
	 * Copy share URL to clipboard
	 */
	const copyShareUrl = useCallback(async () => {
		const url = generateShareUrl();

		// Check if URL generation failed due to size limits
		if (!url) {
			toast.error("Too many gradients to share", {
				description:
					"Your collection is too large for a single URL. Try sharing fewer gradients.",
			});
			return false;
		}

		// Check if URL encoding failed
		if (!url.includes(URL_PARAM)) {
			toast.error("Failed to create share URL", {
				description: "Could not encode gradients. Please try again.",
			});
			return false;
		}

		try {
			await navigator.clipboard.writeText(url);
			return true;
		} catch (error) {
			console.error("Failed to copy URL to clipboard:", error);
			return false;
		}
	}, [generateShareUrl]);

	/**
	 * Get a gradient by ID
	 */
	const getGradient = useCallback(
		(id: string) => {
			return gradients.find((g) => g.id === id);
		},
		[gradients],
	);

	/**
	 * Handle merging imported gradients with existing ones
	 */
	const handleImportMerge = useCallback(() => {
		if (!pendingImport) return;

		const merged = [...pendingImport.gradients, ...gradients];
		setGradients(merged);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

		toast.success("Gradients merged!", {
			description: `Added ${pendingImport.gradients.length} ${pendingImport.gradients.length === 1 ? "gradient" : "gradients"} to your collection`,
		});

		setPendingImport(null);

		// Clear URL params after import
		window.history.replaceState({}, "", window.location.pathname);
	}, [pendingImport, gradients]);

	/**
	 * Handle replacing all gradients with imported ones
	 */
	const handleImportReplace = useCallback(() => {
		if (!pendingImport) return;

		setGradients(pendingImport.gradients);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingImport.gradients));

		toast.success("Gradients replaced!", {
			description: `Loaded ${pendingImport.gradients.length} ${pendingImport.gradients.length === 1 ? "gradient" : "gradients"} from shared link`,
		});

		setPendingImport(null);

		// Clear URL params after import
		window.history.replaceState({}, "", window.location.pathname);
	}, [pendingImport]);

	/**
	 * Handle ignoring imported gradients
	 */
	const handleImportIgnore = useCallback(() => {
		toast.info("Import cancelled", {
			description: "Kept your existing gradients",
		});

		setPendingImport(null);

		// Clear URL params
		window.history.replaceState({}, "", window.location.pathname);
	}, []);

	return {
		gradients,
		isInitialized,
		addGradient,
		updateGradient,
		deleteGradient,
		clearGradients,
		generateShareUrl,
		copyShareUrl,
		getGradient,
		// Import dialog state and handlers
		pendingImport,
		handleImportMerge,
		handleImportReplace,
		handleImportIgnore,
	};
}
