# Color Converter

A sleek, modern web application that helps designers and developers convert colors between different formats like HEX, RGB, HSL, and more.

## Features

- ✨ Convert any color code (HEX, RGB, HSL, etc.) to multiple formats
- 🎨 Extract colors from uploaded images
- 📋 One-click copy for any color format
- 📦 Export colors as CSS variables or Tailwind config
- 🚀 Modern UI with shadcn/ui components
- 🌓 Light and dark mode support

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- colord for color manipulation
- sonner for toast notifications

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/color-convert.git
cd color-convert
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Adding Colors

- Type any valid color format in the input field (e.g., "#ff0000", "rgb(255, 0, 0)", "hsl(0, 100%, 50%)", etc.)
- Press Enter or click the "Add" button

### Extracting Colors from Images

- Click the "Upload Image" button
- Select an image file
- The app will automatically extract the dominant colors from the image

### Exporting Colors

- Click the "Export" button
- Choose your preferred format:
  - CSS Variables (HEX, RGB, or HSL format)
  - Tailwind Config
- Click to copy the generated code to your clipboard

## License

MIT
