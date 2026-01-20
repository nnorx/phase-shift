import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { getTheme } from "@/lib/theme";

const Toaster = ({ ...props }: ToasterProps) => {
	const [theme, setTheme] = useState<"light" | "dark" | "system">(getTheme);

	// Listen for theme changes
	useEffect(() => {
		const handleThemeChange = () => {
			setTheme(getTheme());
		};

		// Listen for storage events (theme changes in other tabs)
		window.addEventListener("storage", handleThemeChange);

		// Custom event for same-tab theme changes
		window.addEventListener("theme-change", handleThemeChange);

		return () => {
			window.removeEventListener("storage", handleThemeChange);
			window.removeEventListener("theme-change", handleThemeChange);
		};
	}, []);

	return (
		<Sonner
			theme={theme}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			{...props}
		/>
	);
};

export { Toaster };
