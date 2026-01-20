import { Pencil, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { encodeGradients } from "@/lib/gradient-serialization";
import { getColorName } from "@/lib/palettes";
import type { Gradient } from "@/types/gradient";
import { CanvasRenderer } from "./CanvasRenderer";
import { ExportDialog } from "./ExportDialog";

interface GradientCardProps {
	gradient: Gradient;
	onDelete: () => void;
	onEdit: () => void;
}

export function GradientCard({
	gradient,
	onDelete,
	onEdit,
}: GradientCardProps) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleShare = async () => {
		const encoded = encodeGradients([gradient]);
		const url = new URL(window.location.href);
		url.searchParams.set("gradients", encoded);

		try {
			await navigator.clipboard.writeText(url.toString());
			toast.success("Gradient link copied!", {
				description: "Share this link to let others import this gradient",
			});
		} catch (error) {
			console.error("Failed to copy URL:", error);
			toast.error("Failed to copy link", {
				description: "Please check clipboard permissions and try again",
			});
		}
	};

	const handleDelete = () => {
		if (showDeleteConfirm) {
			onDelete();
		} else {
			setShowDeleteConfirm(true);
			setTimeout(() => setShowDeleteConfirm(false), 3000);
		}
	};

	return (
		<Card className="fade-in slide-in-from-bottom-2 group animate-in overflow-hidden p-0 duration-500">
			<CardHeader className="block p-0">
				<div className="aspect-square overflow-hidden bg-[repeating-conic-gradient(#eee_0%_25%,white_0%_50%)] bg-size-[20px_20px]">
					<CanvasRenderer
						gradient={gradient}
						size={512}
						className="h-full w-full"
					/>
				</div>
			</CardHeader>
			<CardContent className="flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary" className="text-xs">
						Mesh Gradient
					</Badge>
					<Badge variant="outline" className="text-xs">
						{gradient.colorStops.length}{" "}
						{gradient.colorStops.length === 1 ? "color" : "colors"}
					</Badge>
				</div>
				<div className="mt-2 flex flex-wrap gap-1.5">
					{gradient.colorStops.map((stop, index) => (
						<TooltipProvider key={`${stop.color}-${index}`}>
							<Tooltip>
								<TooltipTrigger asChild>
									<div
										className="h-6 w-6 rounded border border-border"
										style={{ backgroundColor: stop.color }}
									/>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-mono text-xs">
										{getColorName(stop.color)}
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					))}
				</div>
			</CardContent>
			<CardFooter className="flex flex-wrap gap-2 border-t p-3">
				<ExportDialog gradient={gradient} />
				<Button variant="outline" size="sm" onClick={onEdit}>
					<Pencil className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="sm" onClick={handleShare}>
					<Share2 className="h-4 w-4" />
				</Button>
				<TooltipProvider>
					<Tooltip open={showDeleteConfirm}>
						<TooltipTrigger asChild>
							<Button
								variant={showDeleteConfirm ? "destructive" : "outline"}
								size="sm"
								onClick={handleDelete}
								className="ml-auto"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Click again to confirm</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</CardFooter>
		</Card>
	);
}
