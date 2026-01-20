export interface ColorInfo {
	hex: string;
	name: string;
}

export interface Palette {
	id: string;
	name: string;
	category: "warm" | "cool" | "vibrant" | "muted";
	colors: ColorInfo[];
}

export const palettes: Palette[] = [
	{
		id: "sunset",
		name: "Sunset",
		category: "warm",
		colors: [
			{ hex: "#FF6B6B", name: "Coral" },
			{ hex: "#FF8E53", name: "Orange" },
			{ hex: "#FFA94D", name: "Amber" },
			{ hex: "#FFD93D", name: "Gold" },
			{ hex: "#FFE66D", name: "Sunlight" },
			{ hex: "#FF7E67", name: "Peach" },
			{ hex: "#FF5757", name: "Ruby" },
			{ hex: "#C44569", name: "Berry" },
		],
	},
	{
		id: "ocean",
		name: "Ocean",
		category: "cool",
		colors: [
			{ hex: "#4ECDC4", name: "Turquoise" },
			{ hex: "#3EACB4", name: "Teal" },
			{ hex: "#2C8BA4", name: "Ocean" },
			{ hex: "#1A6B94", name: "Deep Blue" },
			{ hex: "#6DD5FA", name: "Sky" },
			{ hex: "#4FB8ED", name: "Azure" },
			{ hex: "#2E86AB", name: "Cerulean" },
			{ hex: "#17547E", name: "Navy" },
		],
	},
	{
		id: "forest",
		name: "Forest",
		category: "cool",
		colors: [
			{ hex: "#6BCF7F", name: "Mint" },
			{ hex: "#4CAF50", name: "Green" },
			{ hex: "#2E8B57", name: "Forest" },
			{ hex: "#1B5E20", name: "Pine" },
			{ hex: "#8BC34A", name: "Lime" },
			{ hex: "#689F38", name: "Olive" },
			{ hex: "#558B2F", name: "Moss" },
			{ hex: "#33691E", name: "Dark Green" },
		],
	},
	{
		id: "neon",
		name: "Neon",
		category: "vibrant",
		colors: [
			{ hex: "#FF007F", name: "Hot Pink" },
			{ hex: "#FF00FF", name: "Magenta" },
			{ hex: "#8000FF", name: "Purple" },
			{ hex: "#00FFFF", name: "Cyan" },
			{ hex: "#00FF00", name: "Lime" },
			{ hex: "#FFFF00", name: "Yellow" },
			{ hex: "#FF4500", name: "Orange Red" },
			{ hex: "#FF1493", name: "Deep Pink" },
		],
	},
	{
		id: "pastel",
		name: "Pastel",
		category: "muted",
		colors: [
			{ hex: "#FFB3BA", name: "Pink" },
			{ hex: "#FFDFBA", name: "Peach" },
			{ hex: "#FFFFBA", name: "Cream" },
			{ hex: "#BAFFC9", name: "Mint" },
			{ hex: "#BAE1FF", name: "Sky" },
			{ hex: "#D4A5FF", name: "Lavender" },
			{ hex: "#FFB3E6", name: "Rose" },
			{ hex: "#C9BAFF", name: "Periwinkle" },
		],
	},
	{
		id: "earth",
		name: "Earth",
		category: "warm",
		colors: [
			{ hex: "#8D6E63", name: "Clay" },
			{ hex: "#A1887F", name: "Taupe" },
			{ hex: "#BCAAA4", name: "Sand" },
			{ hex: "#D7CCC8", name: "Beige" },
			{ hex: "#6D4C41", name: "Brown" },
			{ hex: "#5D4037", name: "Chocolate" },
			{ hex: "#4E342E", name: "Espresso" },
			{ hex: "#3E2723", name: "Dark Brown" },
		],
	},
	{
		id: "royal",
		name: "Royal",
		category: "vibrant",
		colors: [
			{ hex: "#9C27B0", name: "Purple" },
			{ hex: "#673AB7", name: "Deep Purple" },
			{ hex: "#3F51B5", name: "Indigo" },
			{ hex: "#1E88E5", name: "Blue" },
			{ hex: "#C2185B", name: "Pink" },
			{ hex: "#D32F2F", name: "Red" },
			{ hex: "#F57C00", name: "Orange" },
			{ hex: "#FBC02D", name: "Gold" },
		],
	},
	{
		id: "monochrome",
		name: "Monochrome",
		category: "muted",
		colors: [
			{ hex: "#FFFFFF", name: "White" },
			{ hex: "#F5F5F5", name: "Snow" },
			{ hex: "#E0E0E0", name: "Silver" },
			{ hex: "#BDBDBD", name: "Gray" },
			{ hex: "#757575", name: "Dark Gray" },
			{ hex: "#424242", name: "Charcoal" },
			{ hex: "#212121", name: "Almost Black" },
			{ hex: "#000000", name: "Black" },
		],
	},
	{
		id: "tropical",
		name: "Tropical",
		category: "vibrant",
		colors: [
			{ hex: "#FF6B9D", name: "Hibiscus" },
			{ hex: "#FFA07A", name: "Coral" },
			{ hex: "#FFD700", name: "Gold" },
			{ hex: "#32CD32", name: "Lime" },
			{ hex: "#00CED1", name: "Turquoise" },
			{ hex: "#FF69B4", name: "Hot Pink" },
			{ hex: "#FF8C00", name: "Mango" },
			{ hex: "#7FFF00", name: "Chartreuse" },
		],
	},
	{
		id: "aurora",
		name: "Aurora",
		category: "cool",
		colors: [
			{ hex: "#84FAB0", name: "Mint" },
			{ hex: "#8FD3F4", name: "Sky" },
			{ hex: "#A8EDEA", name: "Aqua" },
			{ hex: "#D4A5FF", name: "Lavender" },
			{ hex: "#C2E9FB", name: "Ice" },
			{ hex: "#667EEA", name: "Purple" },
			{ hex: "#764BA2", name: "Deep Purple" },
			{ hex: "#4A00E0", name: "Violet" },
		],
	},
	{
		id: "fire",
		name: "Fire",
		category: "warm",
		colors: [
			{ hex: "#FF0000", name: "Red" },
			{ hex: "#FF4500", name: "Orange Red" },
			{ hex: "#FF6347", name: "Tomato" },
			{ hex: "#FF7F50", name: "Coral" },
			{ hex: "#FFA500", name: "Orange" },
			{ hex: "#FFD700", name: "Gold" },
			{ hex: "#FFFF00", name: "Yellow" },
			{ hex: "#DC143C", name: "Crimson" },
		],
	},
	{
		id: "candy",
		name: "Candy",
		category: "vibrant",
		colors: [
			{ hex: "#FF6EC7", name: "Bubblegum" },
			{ hex: "#FFB6C1", name: "Light Pink" },
			{ hex: "#FFA500", name: "Orange" },
			{ hex: "#FFD700", name: "Lemon" },
			{ hex: "#98FB98", name: "Mint" },
			{ hex: "#87CEEB", name: "Sky Blue" },
			{ hex: "#DA70D6", name: "Orchid" },
			{ hex: "#FF69B4", name: "Hot Pink" },
		],
	},
];

/**
 * Get a palette by ID
 */
export function getPalette(id: string): Palette | undefined {
	return palettes.find((p) => p.id === id);
}

/**
 * Get palettes by category
 */
export function getPalettesByCategory(
	category: Palette["category"],
): Palette[] {
	return palettes.filter((p) => p.category === category);
}

/**
 * Get default palette (first one)
 */
export function getDefaultPalette(): Palette {
	const defaultPalette = palettes[0];
	if (!defaultPalette) {
		throw new Error("No palettes available");
	}
	return defaultPalette;
}

/**
 * Find a color name by hex value across all palettes
 */
export function getColorName(hex: string): string | undefined {
	for (const palette of palettes) {
		const color = palette.colors.find((c) => c.hex === hex);
		if (color) {
			return color.name;
		}
	}
	return undefined;
}
