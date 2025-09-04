import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const font = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "🎨",
  },
  title: "Colors | Open-Source Color Converter",
  description: "Convert color codes of any format to css color codes.",
  openGraph: {
    title: "Colors | Open-Source Color Converter",
    description: "Convert color codes of any format to css color codes.",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colors | Open-Source Color Converter",
    description: "Convert color codes of any format to css color codes.",
    images: ["/opengraph-image.png"],
  },
  keywords: [
    "color",
    "codes",
    "css",
    "colors",
    "color codes",
    "color code converter",
    "color code",

    "palette generator",
    "scheme generator",
    "swatch generator",
    "color palette generator",
    "color scheme generator",
    "color swatch generator",
    "color palette",

    "open source",
    "open source color converter",
    "open source color codes",
    "open source color code converter",

    "hex converter",
    "rgb converter",
    "hsl converter",
    "oklch converter",
    "rgba converter",
    "hsla converter",
    "oklch converter",

    // RGB combinations
    "rgb to hex",
    "rgb to hsl",
    "rgb to oklch",
    "rgba to hex",
    "rgba to hsl",
    "rgba to oklch",
    // HSL combinations
    "hsl to hex",
    "hsl to rgb",
    "hsl to oklch",
    "hsla to hex",
    "hsla to rgb",
    "hsla to oklch",
    // OKLCH combinations
    "oklch to hex",
    "oklch to rgb",
    "oklch to hsl",
    // HEX combinations
    "hex to rgb",
    "hex to rgba",
    "hex to hsl",
    "hex to hsla",
    "hex to oklch",

    "hex to css",
    "hex to tailwind",
    "hex to css variables",
    "hex to css custom properties",
    "hex to css variables",

    // CSS/Tailwind combinations
    "rgb to css",
    "rgb to tailwind",
    "rgb to css variables",
    "rgba to css",
    "rgba to tailwind",
    "rgba to css variables",

    "hsl to css",
    "hsl to tailwind",
    "hsl to css variables",
    "hsla to css",
    "hsla to tailwind",
    "hsla to css variables",

    "oklch to css",
    "oklch to tailwind",
    "oklch to css variables",

    "hex to css",
    "hex to tailwind",
    "hex to css variables",

    // Common variations
    "color to css",
    "color to tailwind",
    "color to css variables",
    "color to custom properties",
    "tailwind color converter",
    "css color converter",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} min-h-dvh`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-left" />
        </ThemeProvider>
      </body>
    </html>
  );
}
