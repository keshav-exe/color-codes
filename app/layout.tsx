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
  title: "Color Codes",
  description: "Convert color codes of any format to css color codes.",
  openGraph: {
    title: "Color Codes",
    description: "Convert color codes of any format to css color codes.",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Codes",
    description: "Convert color codes of any format to css color codes.",
    images: ["/opengraph-image.png"],
  },
  keywords: [
    "color",
    "codes",
    "css",
    "color codes",
    "color code converter",
    "color code",

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
      <body className={`${font.className} min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div
            className="fixed bottom-0 left-0 w-full h-[50px] z-10 blur-gradient-bottom backdrop-blur-sm"
            style={{
              background:
                "linear-gradient(0deg, hsl(var(--background) / 0.8) 0, hsl(var(--background) / 0.7) 20%, hsl(var(--background) / 0.5) 40%, hsl(var(--background) / 0.3) 60%, hsl(var(--background) / 0.1) 80%, hsl(var(--background) / 0))",
              maskImage:
                "linear-gradient(0deg, #000 0, rgba(0, 0, 0, .9) 20%, rgba(0, 0, 0, .8) 40%, rgba(0, 0, 0, .6) 60%, rgba(0, 0, 0, .4) 80%, transparent)",
            }}
          />
          {children}
          <Toaster richColors position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
