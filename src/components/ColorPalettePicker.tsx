import { Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	getColorName,
	getDefaultPalette,
	type Palette,
	palettes,
} from "@/lib/palettes";
import { cn } from "@/lib/utils";

interface ColorPalettePickerProps {
	selectedColors: string[];
	onColorsChange: (colors: string[]) => void;
	maxColors?: number;
	selectedPaletteId?: string;
	onPaletteChange?: (paletteId: string) => void;
}

export function ColorPalettePicker({
	selectedColors,
	onColorsChange,
	maxColors = 4,
	selectedPaletteId,
	onPaletteChange,
}: ColorPalettePickerProps) {
	const [internalPalette, setInternalPalette] = useState<Palette>(
		getDefaultPalette(),
	);

	// Use controlled palette if provided, otherwise use internal state
	const currentPalette =
		selectedPaletteId
			? palettes.find((p) => p.id === selectedPaletteId) || internalPalette
			: internalPalette;

	const handleColorClick = (hex: string) => {
		if (selectedColors.includes(hex)) {
			// Remove color
			onColorsChange(selectedColors.filter((c) => c !== hex));
		} else if (selectedColors.length < maxColors) {
			// Add color
			onColorsChange([...selectedColors, hex]);
		}
	};

	const handlePaletteChange = (paletteId: string) => {
		const palette = palettes.find((p) => p.id === paletteId);
		if (palette) {
			// If controlled, call the parent's handler
			if (onPaletteChange) {
				onPaletteChange(paletteId);
			} else {
				// Otherwise update internal state
				setInternalPalette(palette);
			}
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<div className="font-medium text-sm">Color Palette</div>
				<Select value={currentPalette.id} onValueChange={handlePaletteChange}>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{palettes.map((palette) => (
							<SelectItem key={palette.id} value={palette.id}>
								<div className="flex items-center gap-2">
									<span>{palette.name}</span>
									<Badge variant="outline" className="text-xs">
										{palette.category}
									</Badge>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<div className="font-medium text-sm">
						Select Colors ({selectedColors.length}/{maxColors})
					</div>
					{selectedColors.length > 0 && (
						<button
							type="button"
							onClick={() => onColorsChange([])}
							className="text-muted-foreground text-xs hover:text-foreground"
						>
							Clear
						</button>
					)}
				</div>

				<ScrollArea className="h-[280px] rounded-md border p-4">
					<div className="grid grid-cols-4 gap-2">
						{currentPalette.colors.map((color) => {
							const isSelected = selectedColors.includes(color.hex);
							const selectionIndex = selectedColors.indexOf(color.hex);

							return (
								<button
									type="button"
									key={color.hex}
									onClick={() => handleColorClick(color.hex)}
									className={cn(
										"group relative aspect-square rounded-lg border-2 transition-all hover:scale-105",
										isSelected
											? "border-foreground shadow-lg"
											: "border-transparent hover:border-border",
									)}
									style={{ backgroundColor: color.hex }}
									title={color.name}
								>
									{isSelected && (
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/90 shadow-sm">
												<Check className="h-4 w-4" />
											</div>
										</div>
									)}
									{isSelected && (
										<div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground font-bold text-[10px] text-background">
											{selectionIndex + 1}
										</div>
									)}
								</button>
							);
						})}
					</div>

					<div className="mt-4 space-y-1">
						<p className="text-muted-foreground text-xs">Selected colors:</p>
						<div className="flex flex-wrap gap-2">
							{selectedColors.length === 0 ? (
								<p className="text-muted-foreground text-xs italic">
									No colors selected
								</p>
							) : (
								selectedColors.map((hex, index) => {
									// First try to find in current palette, then search all palettes
									const colorInfo =
										currentPalette.colors.find((c) => c.hex === hex) ||
										(getColorName(hex)
											? { hex, name: getColorName(hex) as string }
											: null);
									return (
										<Badge
											key={hex}
											variant="secondary"
											className="gap-1.5 text-xs"
										>
											<div
												className="h-3 w-3 rounded-full border"
												style={{ backgroundColor: hex }}
											/>
											<span>{index + 1}.</span>
											<span>{colorInfo?.name || hex}</span>
										</Badge>
									);
								})
							)}
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
