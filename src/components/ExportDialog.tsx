import { Download } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	applyCircularMask,
	downloadCanvas,
	drawGradient,
	generateGradientFilename,
} from "@/lib/canvas-gradients";
import { MIN_EXPORT_INTERVAL } from "@/lib/config";
import type { Gradient } from "@/types/gradient";

interface ExportDialogProps {
	gradient: Gradient;
	trigger?: React.ReactNode;
}

const EXPORT_SIZES = [
	{ label: "32×32", value: 32 },
	{ label: "64×64", value: 64 },
	{ label: "128×128", value: 128 },
	{ label: "256×256", value: 256 },
	{ label: "512×512", value: 512 },
	{ label: "1024×1024", value: 1024 },
	{ label: "2048×2048", value: 2048 },
];

export function ExportDialog({ gradient, trigger }: ExportDialogProps) {
	const [size, setSize] = useState(512);
	const [isExporting, setIsExporting] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [cropToCircle, setCropToCircle] = useState(false);
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);
	const lastExportTimeRef = useRef<number>(0);

	// Update preview function
	const updatePreview = useCallback(
		(canvas: HTMLCanvasElement | null) => {
			if (canvas) {
				drawGradient(canvas, gradient, 256);
				if (cropToCircle) {
					applyCircularMask(canvas);
				}
			}
		},
		[gradient, cropToCircle],
	);

	// Update preview when cropToCircle changes
	useEffect(() => {
		updatePreview(previewCanvasRef.current);
	}, [updatePreview]);

	const handleExport = async () => {
		// Rate limiting check
		const now = Date.now();
		const timeSinceLastExport = now - lastExportTimeRef.current;
		if (timeSinceLastExport < MIN_EXPORT_INTERVAL) {
			toast.warning("Please wait", {
				description: "Exports are rate-limited to prevent browser issues.",
			});
			return;
		}

		setIsExporting(true);
		lastExportTimeRef.current = now;

		try {
			// Create a temporary canvas for export
			const canvas = document.createElement("canvas");
			drawGradient(canvas, gradient, size);

			// Apply circular mask if enabled
			if (cropToCircle) {
				applyCircularMask(canvas);
			}

			const filename = generateGradientFilename(gradient, size);
			await downloadCanvas(canvas, filename);

			toast.success("Gradient exported!", {
				description: `Saved as ${size}×${size}px PNG`,
			});

			// Close dialog after successful export
			setIsOpen(false);
		} catch (error) {
			console.error("Failed to export gradient:", error);
			toast.error("Export failed", {
				description: "Could not save gradient image. Please try again.",
			});
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4" />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Export Gradient</DialogTitle>
					<DialogDescription>
						Choose the size for your gradient image export.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="export-size">Image Size</Label>
						<Select
							value={size.toString()}
							onValueChange={(value) => setSize(Number.parseInt(value, 10))}
						>
							<SelectTrigger id="export-size">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{EXPORT_SIZES.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value.toString()}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="crop-circle"
							checked={cropToCircle}
							onChange={(e) => setCropToCircle(e.target.checked)}
							className="h-4 w-4 rounded border-gray-300"
						/>
						<Label htmlFor="crop-circle" className="cursor-pointer">
							Crop to circle with transparent background
						</Label>
					</div>

					<div className="space-y-2">
						<Label>Preview</Label>
						<div className="overflow-hidden rounded-md border">
							<div className="aspect-square w-full bg-[repeating-conic-gradient(#eee_0%_25%,white_0%_50%)] bg-size-[20px_20px]">
								<canvas
									ref={(canvas) => {
										previewCanvasRef.current = canvas;
										updatePreview(canvas);
									}}
									className="h-full w-full"
									style={{ imageRendering: "auto" }}
								/>
							</div>
						</div>
					</div>

					<div className="text-muted-foreground text-sm">File format: PNG</div>
				</div>

				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={() => setIsOpen(false)}
						disabled={isExporting}
					>
						Cancel
					</Button>
					<Button onClick={handleExport} disabled={isExporting}>
						{isExporting ? "Exporting..." : "Download"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
