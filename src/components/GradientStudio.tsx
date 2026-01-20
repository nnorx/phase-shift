import { Plus, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImportDialog } from "@/components/ImportDialog";
import { InteractiveMeshCanvas } from "@/components/InteractiveMeshCanvas";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGradients } from "@/hooks/useGradients";
import {
	createColorStop,
	getDefaultGradientConfig,
} from "@/lib/gradient-factories";
import { getBlendModes } from "@/lib/gradient-validation";
import type { BlendMode, ColorStop, Gradient } from "@/types/gradient";
import { ColorPalettePicker } from "./ColorPalettePicker";
import { ColorStopControls } from "./ColorStopControls";
import { GradientGrid } from "./GradientGrid";

export function GradientStudio() {
	const {
		gradients,
		addGradient,
		deleteGradient,
		updateGradient,
		copyShareUrl,
		pendingImport,
		handleImportMerge,
		handleImportReplace,
		handleImportIgnore,
	} = useGradients();

	// Current gradient configuration state
	const [selectedColors, setSelectedColors] = useState<string[]>([]);
	const [colorStops, setColorStops] = useState<ColorStop[]>([]);
	const [blendMode, setBlendMode] = useState<BlendMode>("lighter");
	const [editingGradientId, setEditingGradientId] = useState<string | null>(
		null,
	);

	// Handle color selection from palette
	const handleColorsChange = (colors: string[]) => {
		setSelectedColors(colors);

		// Update color stops: add new colors, remove deselected ones
		const newColorStops: ColorStop[] = [];

		// Keep existing positions for colors that are still selected
		for (const color of colors) {
			const existing = colorStops.find((stop) => stop.color === color);
			if (existing) {
				newColorStops.push(existing);
			} else {
				// Create new color stop with random position
				newColorStops.push(createColorStop(color));
			}
		}

		setColorStops(newColorStops);
	};

	const handleCreateGradient = () => {
		if (colorStops.length === 0) {
			return;
		}

		if (editingGradientId) {
			// Update existing gradient
			updateGradient(editingGradientId, {
				colorStops,
				blendMode,
			});
			setEditingGradientId(null);
			toast.success("Gradient updated!");
		} else {
			// Create new gradient
			addGradient({
				colorStops,
				blendMode,
			});
			toast.success("Gradient created!");
		}
	};

	const handleSaveAsNew = () => {
		if (colorStops.length === 0) {
			return;
		}

		// Create new gradient with current edits
		addGradient({
			colorStops,
			blendMode,
		});
		setEditingGradientId(null);
		toast.success("Gradient saved as new!");
	};

	const handleEditGradient = (gradient: Gradient) => {
		setColorStops([...gradient.colorStops]);
		setSelectedColors(gradient.colorStops.map((stop) => stop.color));
		setBlendMode(gradient.blendMode || "lighter");
		setEditingGradientId(gradient.id);

		// Scroll to top to show the editor
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleNewGradient = () => {
		const defaults = getDefaultGradientConfig();
		setSelectedColors([]);
		setColorStops(defaults.colorStops);
		setBlendMode(defaults.blendMode || "lighter");
		setEditingGradientId(null);
	};

	const handleShareSession = async () => {
		const success = await copyShareUrl();
		if (success) {
			toast.success("Share URL copied!", {
				description: `${gradients.length} ${gradients.length === 1 ? "gradient" : "gradients"} ready to share`,
			});
		} else {
			toast.error("Failed to copy URL", {
				description: "Please check clipboard permissions and try again",
			});
		}
	};

	const handleColorStopUpdate = (
		index: number,
		updates: Partial<ColorStop>,
	) => {
		setColorStops((prev) =>
			prev.map((stop, i) => (i === index ? { ...stop, ...updates } : stop)),
		);
	};

	const handleIntensityChange = (index: number, intensity: number) => {
		handleColorStopUpdate(index, { intensity });
	};

	const handleRemoveColorStop = (index: number) => {
		const removedColor = colorStops[index]?.color;
		setColorStops((prev) => prev.filter((_, i) => i !== index));
		if (removedColor) {
			setSelectedColors((prev) => prev.filter((c) => c !== removedColor));
		}
	};

	const currentGradientPreview: Gradient = {
		id: "preview",
		colorStops,
		blendMode,
		createdAt: Date.now(),
	};

	const blendModes = getBlendModes();

	return (
		<div className="min-h-screen bg-background">
			{/* Import Dialog */}
			{pendingImport?.show && (
				<ImportDialog
					open={pendingImport.show}
					gradientCount={pendingImport.gradients.length}
					existingCount={gradients.length}
					onMerge={handleImportMerge}
					onReplace={handleImportReplace}
					onIgnore={handleImportIgnore}
				/>
			)}

			{/* Header */}
			<header className="fade-in animate-in border-b duration-500">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<img src="/logo.png" alt="Phase Shift" className="h-10 w-10" />
							<div>
								<h1 className="font-bold text-xl">Phase Shift</h1>
								<p className="text-muted-foreground text-sm">
									Mesh Gradient Generator
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{gradients.length > 0 && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												onClick={handleShareSession}
											>
												<Share2 className="mr-2 h-4 w-4" />
												Share Session
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Copy shareable URL with all gradients</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
							<Badge variant="secondary">
								{gradients.length}{" "}
								{gradients.length === 1 ? "gradient" : "gradients"}
							</Badge>
							<ThemeToggle />
						</div>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="fade-in slide-in-from-bottom-4 grid animate-in gap-8 duration-700 lg:grid-cols-[400px_1fr]">
					{/* Left Panel - Editor */}
					<div className="min-w-0 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>
										{editingGradientId ? "Edit Gradient" : "Create Gradient"}
									</span>
									{editingGradientId && (
										<Button
											variant="ghost"
											size="sm"
											onClick={handleNewGradient}
										>
											Cancel
										</Button>
									)}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Preview */}
								<div className="space-y-2">
									<div className="font-medium text-sm">Preview</div>
									<div className="overflow-hidden rounded-lg border">
										<div className="aspect-square w-full bg-[repeating-conic-gradient(#eee_0%_25%,white_0%_50%)] bg-size-[20px_20px]">
											<InteractiveMeshCanvas
												gradient={currentGradientPreview}
												onColorStopUpdate={handleColorStopUpdate}
												className="w-full"
											/>
										</div>
									</div>
									<p className="text-muted-foreground text-xs">
										💡 Drag the numbered markers to reposition colors
									</p>
								</div>

								{/* Blend Mode Selector */}
								<div className="space-y-2">
									<Label htmlFor="blend-mode">Blend Mode</Label>
									<Select
										value={blendMode}
										onValueChange={(value) => setBlendMode(value as BlendMode)}
									>
										<SelectTrigger id="blend-mode" className="w-full p-6">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="max-h-[300px]">
											{blendModes.map((mode) => (
												<SelectItem
													key={mode.value}
													value={mode.value}
													className="py-3"
												>
													<div className="flex flex-col">
														<span className="font-medium">{mode.label}</span>
														<span className="text-muted-foreground text-xs">
															{mode.description}
														</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Color Stop Controls */}
								<ColorStopControls
									colorStops={colorStops}
									onIntensityChange={handleIntensityChange}
									onRemove={handleRemoveColorStop}
								/>

								{/* Color Picker */}
								<ColorPalettePicker
									selectedColors={selectedColors}
									onColorsChange={handleColorsChange}
									maxColors={8}
								/>

								{/* Action Buttons */}
								{editingGradientId ? (
									<div className="flex gap-2">
										<Button
											variant="outline"
											className="flex-1"
											onClick={handleSaveAsNew}
											disabled={colorStops.length === 0}
										>
											<Plus className="mr-2 h-4 w-4" />
											Save as New
										</Button>
										<Button
											className="flex-1"
											onClick={handleCreateGradient}
											disabled={colorStops.length === 0}
										>
											Update Gradient
										</Button>
									</div>
								) : (
									<Button
										className="w-full"
										onClick={handleCreateGradient}
										disabled={colorStops.length === 0}
									>
										<Plus className="mr-2 h-4 w-4" />
										Create Gradient
									</Button>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Panel - Gradient Grid */}
					<div className="min-w-0 space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="font-semibold text-2xl">Your Gradients</h2>
							{gradients.length > 0 && (
								<Button variant="outline" onClick={handleNewGradient}>
									<Plus className="mr-2 h-4 w-4" />
									New
								</Button>
							)}
						</div>

						<GradientGrid
							gradients={gradients}
							onDeleteGradient={deleteGradient}
							onEditGradient={handleEditGradient}
						/>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t py-8">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground text-sm">
						<p>
							Built by{" "}
							<a
								href="https://nicknorcross.com"
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-4 transition-colors hover:decoration-foreground"
							>
								Nick Norcross
							</a>
						</p>
						<p className="text-muted-foreground/75 text-xs">
							Open source on{" "}
							<a
								href="https://github.com/nnorx/phase-shift"
								target="_blank"
								rel="noopener noreferrer"
								className="underline decoration-muted-foreground/30 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground/50"
							>
								GitHub
							</a>
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
