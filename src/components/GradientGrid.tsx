import { Sparkles } from "lucide-react";
import type { Gradient } from "@/types/gradient";
import { GradientCard } from "./GradientCard";

interface GradientGridProps {
	gradients: Gradient[];
	onDeleteGradient: (id: string) => void;
	onEditGradient: (gradient: Gradient) => void;
}

export function GradientGrid({
	gradients,
	onDeleteGradient,
	onEditGradient,
}: GradientGridProps) {
	if (gradients.length === 0) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
				<Sparkles className="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">No gradients yet</h3>
				<p className="text-muted-foreground text-sm">
					Select colors and configure options to create your first gradient
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-3">
			{gradients.map((gradient) => (
				<GradientCard
					key={gradient.id}
					gradient={gradient}
					onDelete={() => onDeleteGradient(gradient.id)}
					onEdit={() => onEditGradient(gradient)}
				/>
			))}
		</div>
	);
}
