import { AlertCircle, Download, Replace, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ImportDialogProps {
	open: boolean;
	gradientCount: number;
	existingCount: number;
	onMerge: () => void;
	onReplace: () => void;
	onIgnore: () => void;
}

export function ImportDialog({
	open,
	gradientCount,
	existingCount,
	onMerge,
	onReplace,
	onIgnore,
}: ImportDialogProps) {
	return (
		<Dialog open={open} onOpenChange={(open) => !open && onIgnore()}>
			<DialogContent
				className="sm:max-w-md"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-yellow-500" />
						Import Shared Gradients?
					</DialogTitle>
					<DialogDescription>
						This link contains {gradientCount}{" "}
						{gradientCount === 1 ? "gradient" : "gradients"}.
						{existingCount > 0 && (
							<> You currently have {existingCount} saved.</>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-4">
					<Button
						variant="default"
						className="w-full justify-start p-6"
						onClick={onMerge}
					>
						<Download className="mr-2 h-4 w-4" />
						<div className="flex flex-col items-start">
							<span>Merge with Existing</span>
							<span className="font-normal text-muted-foreground text-xs">
								Add {gradientCount} new{" "}
								{gradientCount === 1 ? "gradient" : "gradients"} to your
								collection
							</span>
						</div>
					</Button>

					<Button
						variant="outline"
						className="w-full justify-start p-6"
						onClick={onReplace}
					>
						<Replace className="mr-2 h-4 w-4" />
						<div className="flex flex-col items-start">
							<span>Replace All</span>
							<span className="font-normal text-muted-foreground text-xs">
								Clear existing and load {gradientCount} from URL
							</span>
						</div>
					</Button>

					<Button
						variant="ghost"
						className="w-full justify-start p-6"
						onClick={onIgnore}
					>
						<X className="mr-2 h-4 w-4" />
						<div className="flex flex-col items-start">
							<span>Ignore</span>
							<span className="font-normal text-muted-foreground text-xs">
								Keep your current gradients and ignore the URL
							</span>
						</div>
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
