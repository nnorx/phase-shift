import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getColorName } from "@/lib/palettes";
import type { ColorStop } from "@/types/gradient";

interface ColorStopControlsProps {
	colorStops: ColorStop[];
	onIntensityChange: (index: number, intensity: number) => void;
	onRemove: (index: number) => void;
}

export function ColorStopControls({
	colorStops,
	onIntensityChange,
	onRemove,
}: ColorStopControlsProps) {
	if (colorStops.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-6 text-center">
				<p className="text-muted-foreground text-sm">
					Select colors from the palette below to begin creating your mesh
					gradient
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="font-medium text-sm">
				Color Positions ({colorStops.length})
			</div>
			<div className="space-y-3">
				{colorStops.map((stop, index) => {
					const colorName = getColorName(stop.color);

					return (
						<div
							key={`${stop.color}-${index}`}
							className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
						>
							<div className="mb-2 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted font-mono text-xs">
										{index + 1}
									</div>
									<div
										className="h-4 w-4 rounded-full border"
										style={{ backgroundColor: stop.color }}
									/>
									<span className="text-sm">{colorName || stop.color}</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onRemove(index)}
									className="h-7 w-7 p-0"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</div>

							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<Label htmlFor={`intensity-${index}`} className="text-xs">
										Intensity: {Math.round(stop.intensity)}%
									</Label>
								</div>
								<Slider
									id={`intensity-${index}`}
									min={10}
									max={100}
									step={1}
									value={[stop.intensity]}
									onValueChange={(values) =>
										onIntensityChange(index, values[0] ?? 60)
									}
									className="w-full"
								/>
							</div>

							<div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
								<div>X: {Math.round(stop.x)}%</div>
								<div>Y: {Math.round(stop.y)}%</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
