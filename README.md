# Phase Shift

A mesh gradient generator with an intuitive drag-and-drop interface. Create beautiful, organic cloud-like gradients by positioning colors freely across the canvas.

![Phase Shift](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

✨ **Curated Color Palettes** - Choose from 12 professionally designed color palettes with harmonic color relationships

🎨 **Mesh Gradients** - Create complex, cloud-like gradients with freely positioned colors

🖱️ **Interactive Canvas** - Drag and drop color markers directly on the preview to position them

🎛️ **Intensity Controls** - Adjust the spread and intensity of each color individually

💾 **Session Persistence** - Your gradients are automatically saved to localStorage and can be shared via URL

📤 **Flexible Export** - Export gradients as PNG images in multiple sizes (32px to 2048px)

✏️ **Edit & Refine** - Modify existing gradients and see changes in real-time

🔗 **Share Sessions** - Generate shareable URLs with all your gradient configurations encoded

## Getting Started

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Visit `http://localhost:5173` to start creating gradients!

## Usage

1. **Select Colors** - Browse through curated palettes and select colors for your mesh gradient (up to 8)
2. **Position Colors** - Drag the numbered markers on the preview canvas to position each color
3. **Adjust Intensity** - Use the intensity sliders to control how far each color spreads
4. **Create Gradient** - Click "Create Gradient" to add it to your collection
5. **Export** - Click the Export button on any gradient card to download as PNG
6. **Share** - Use "Share Session" to get a URL that restores all your gradients

## Tech Stack

- **React 19** with [React Compiler](https://react.dev/learn/react-compiler) for automatic memoization
- **TypeScript** with strict mode and comprehensive type safety
- **Vite** (rolldown-vite) for lightning-fast builds
- **Tailwind CSS v4** with CSS variables for theming
- **Geist Sans** by Vercel for modern typography
- **shadcn/ui** components built on Radix UI primitives
- **HTML5 Canvas** for gradient rendering and export
- **Biome** for linting and formatting
- **Vitest** + **React Testing Library** for testing (66 tests)

## Project Structure

```
src/
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── CanvasRenderer.tsx          # Static canvas gradient renderer
│   ├── ColorPalettePicker.tsx      # Color palette selection interface
│   ├── ColorStopControls.tsx       # Individual color stop adjustments
│   ├── ErrorBoundary.tsx           # Error boundary wrapper
│   ├── ExportDialog.tsx            # Export configuration & download
│   ├── GradientCard.tsx            # Individual gradient display card
│   ├── GradientGrid.tsx            # Grid layout for all gradients
│   ├── GradientStudio.tsx          # Main application interface
│   ├── ImportDialog.tsx            # URL import confirmation dialog
│   ├── InteractiveMeshCanvas.tsx   # Drag-and-drop gradient editor
│   └── ThemeToggle.tsx             # Light/dark mode toggle
├── hooks/
│   └── useGradients.ts             # Gradient state management & persistence
├── lib/
│   ├── canvas-gradients.ts         # Canvas rendering & export utilities
│   ├── config.ts                   # App constants & security limits
│   ├── gradient-factories.ts       # Gradient creation functions
│   ├── gradient-serialization.ts   # URL encoding/decoding
│   ├── gradient-validation.ts      # Validation & blend mode metadata
│   ├── palettes.ts                 # Curated color palettes
│   ├── theme.ts                    # Theme initialization & management
│   └── utils.ts                    # General utility functions
├── types/
│   └── gradient.ts                 # TypeScript type definitions
├── App.tsx                         # Root component
├── main.tsx                        # Entry point
└── styles.css                      # Global styles & design tokens
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Type-check and build for production |
| `yarn preview` | Preview production build |
| `yarn lint` | Check for linting errors |
| `yarn format` | Auto-fix linting errors and format code |
| `yarn type-check` | Run TypeScript type checking |
| `yarn test` | Run tests once |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage report |
| `yarn knip` | Find unused code and dependencies |

## Color Palettes

Phase Shift includes 12 curated color palettes:

- **Sunset** (warm) - Coral, orange, and amber tones
- **Ocean** (cool) - Turquoise, teal, and deep blue
- **Forest** (cool) - Mint, green, and pine shades
- **Neon** (vibrant) - Hot pink, magenta, cyan, and lime
- **Pastel** (muted) - Soft pinks, peach, mint, and sky
- **Earth** (warm) - Clay, taupe, sand, and brown
- **Royal** (vibrant) - Purple, indigo, and gold
- **Monochrome** (muted) - Grayscale from white to black
- **Tropical** (vibrant) - Hibiscus, coral, turquoise, and lime
- **Aurora** (cool) - Mint, sky, aqua, and lavender
- **Fire** (warm) - Red, orange, and yellow flames
- **Candy** (vibrant) - Bubblegum, lemon, mint, and hot pink

## License

MIT © 2026

## Security

Phase Shift implements several security measures:

- **Content Security Policy** - Protects against XSS attacks
- **Input Validation** - All gradient data is validated with strict limits
- **Rate Limiting** - Export operations are rate-limited to prevent DoS
- **Payload Size Limits** - URL imports are capped at 50KB to prevent memory exhaustion
- **Safe Serialization** - URL encoding strips potentially dangerous data

## Acknowledgments

Built by [Nick Norcross](https://nicknorcross.com) with the [frontend-template](https://github.com/nnorx/frontend-template) foundation.
