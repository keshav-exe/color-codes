import {
  convert,
  isValidColor,
  palette,
  scheme,
  swatch,
  formatCSS,
  parseCSS,
} from "colorizr";
import { toast } from "sonner";
import ColorThief from "colorthief";

export const getColorFormats = (color: string) => {
  return {
    hex: convert(color, "hex"),
    rgb: convert(color, "rgb"),
    hsl: convert(color, "hsl"),
    oklch: convert(color, "oklch"),
  };
};

export const generateCssVariables = (
  colors: string[],
  format: "hex" | "rgb" | "hsl" | "oklch",
) => {
  if (colors.length === 0) return "";

  let css = ":root {\n";

  colors.forEach((color, index) => {
    let value = "";

    if (format === "hex" || format === "oklch") {
      // Use convert for hex and oklch (since formatCSS doesn't support these)
      value = convert(color, format);
    } else {
      // Use formatCSS for RGB/HSL for cleaner output
      try {
        const parsed = parseCSS(color, format);
        if (typeof parsed === "object") {
          value = formatCSS(parsed, { format });
        } else {
          value = convert(color, format);
        }
      } catch {
        value = convert(color, format);
      }
    }

    css += `  --color-${index + 1}: ${value};\n`;
  });

  css += "}";
  return css;
};

export const generateAdvancedCssVariables = (
  colors: string[],
  options: {
    format: "hex" | "rgb" | "hsl" | "oklch";
    useModernSyntax?: boolean;
    includeAlpha?: boolean;
    prefix?: string;
  },
) => {
  if (colors.length === 0) return "";

  const {
    format,
    useModernSyntax = true,
    includeAlpha = false,
    prefix = "color",
  } = options;

  let css = ":root {\n";

  colors.forEach((color, index) => {
    let value = "";

    try {
      if (format === "hex") {
        value = convert(color, "hex");
      } else if (format === "oklch") {
        value = convert(color, "oklch");
      } else {
        // Use formatCSS for RGB/HSL
        const parsed = parseCSS(color, format);
        if (typeof parsed === "object") {
          const formatOptions: any = { format };

          // Modern syntax uses spaces instead of commas
          if (useModernSyntax) {
            formatOptions.legacy = false;
          }

          // Add alpha if requested
          if (includeAlpha && !("alpha" in parsed)) {
            formatOptions.alpha = 1;
          }

          value = formatCSS(parsed, formatOptions);
        } else {
          value = convert(color, format);
        }
      }
    } catch {
      // Fallback to convert
      value = convert(color, format);
    }

    css += `  --${prefix}-${index + 1}: ${value};\n`;
  });

  css += "}";
  return css;
};

export const generateTailwindConfig = (colors: string[]) => {
  if (colors.length === 0) return "";

  let config = "module.exports = {\n";
  config += "  theme: {\n";
  config += "    extend: {\n";
  config += "      colors: {\n";

  colors.forEach((color, index) => {
    config += `        color${index + 1}: "${convert(color, "hex")}",\n`;
  });

  config += "      },\n";
  config += "    },\n";
  config += "  },\n";
  config += "}";

  return config;
};

export const handleFileUpload = (
  file: File,
  {
    setIsExtracting,
    setUploadedImage,
    colors,
    addColor,
  }: {
    setIsExtracting: (value: boolean) => void;
    setUploadedImage: (value: string) => void;
    colors: string[];
    addColor: (color: string) => void;
  },
) => {
  setIsExtracting(true);
  toast.loading("Extracting colors...");

  const imageUrl = URL.createObjectURL(file);
  setUploadedImage(imageUrl);

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const img = new Image();

      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          const palette = colorThief.getPalette(img, 8);

          const newColors = palette
            .map(([r, g, b]) => convert(`rgb(${r}, ${g}, ${b})`, "hex"))
            .filter((color) => {
              return !colors.some((existingColor: string) => {
                // Simple color distance check using hex values
                const hex1 = convert(color, "hex").replace("#", "");
                const hex2 = convert(existingColor, "hex").replace("#", "");

                const r1 = parseInt(hex1.slice(0, 2), 16);
                const g1 = parseInt(hex1.slice(2, 4), 16);
                const b1 = parseInt(hex1.slice(4, 6), 16);

                const r2 = parseInt(hex2.slice(0, 2), 16);
                const g2 = parseInt(hex2.slice(2, 4), 16);
                const b2 = parseInt(hex2.slice(4, 6), 16);

                const distance = Math.sqrt(
                  Math.pow(r1 - r2, 2) +
                    Math.pow(g1 - g2, 2) +
                    Math.pow(b1 - b2, 2),
                );
                return distance < 30;
              });
            });

          let addedCount = 0;
          newColors.forEach((color) => {
            if (!colors.includes(color)) {
              addColor(color);
              addedCount++;
            }
          });

          toast.dismiss();
          toast.success(`extracted ${addedCount} colors from image`);
          setIsExtracting(false);
        } catch (error) {
          console.error("error extracting colors:", error);
          toast.dismiss();
          toast.error("error extracting colors", {
            description: "please try a different image",
          });
          setIsExtracting(false);
        }
      };

      img.onerror = () => {
        toast.dismiss();
        toast.error("error loading image");
        setIsExtracting(false);
      };

      img.crossOrigin = "Anonymous";
      img.src = event.target?.result as string;
    } catch (error) {
      console.error("error processing image:", error);
      toast.dismiss();
      toast.error("error processing image");
      setIsExtracting(false);
    }
  };

  reader.onerror = () => {
    toast.dismiss();
    toast.error("error reading file");
    setIsExtracting(false);
  };

  reader.readAsDataURL(file);
};

// Color generators
export const generatePalette = (
  baseColor: string,
  type:
    | "analogous"
    | "monochromatic"
    | "complementary"
    | "triadic" = "analogous",
) => {
  try {
    // colorizr palette only supports 'monochromatic' type
    if (type === "monochromatic") {
      return palette(baseColor, { type: "monochromatic" });
    } else {
      // For other types, fall back to scheme function
      return generateScheme(baseColor, type);
    }
  } catch (error) {
    console.error("Error generating palette:", error);
    return [];
  }
};

export const generateScheme = (
  baseColor: string,
  type: "analogous" | "complementary" | "triadic" = "complementary",
) => {
  try {
    // colorizr scheme supports: analogous, complementary, triadic (no tetradic)
    const validTypes = ["analogous", "complementary", "triadic"];
    const schemeType = validTypes.includes(type) ? type : "complementary";

    return scheme(baseColor, schemeType);
  } catch (error) {
    console.error("Error generating scheme:", error);
    return [];
  }
};

export const generateSwatch = (baseColor: string) => {
  try {
    const swatchData = swatch(baseColor);
    // Convert object to array of colors for easier handling
    return Object.values(swatchData);
  } catch (error) {
    console.error("Error generating swatch:", error);
    return [];
  }
};

export const generateColors = (
  baseColor: string,
  generatorType: "palette" | "scheme" | "swatch",
  options?: {
    paletteType?: "analogous" | "monochromatic" | "complementary" | "triadic";
    schemeType?: "analogous" | "complementary" | "triadic";
  },
) => {
  if (!isValidColor(baseColor)) {
    throw new Error("Invalid base color");
  }

  switch (generatorType) {
    case "palette":
      return generatePalette(baseColor, options?.paletteType);
    case "scheme":
      return generateScheme(baseColor, options?.schemeType);
    case "swatch":
      return generateSwatch(baseColor);
    default:
      return [];
  }
};
