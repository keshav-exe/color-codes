import { colord } from "colord";
import { toast } from "sonner";
import ColorThief from "colorthief";

export const getColorFormats = (color: string) => {
  const c = colord(color);
  return {
    hex: c.toHex(),
    rgb: c.toRgbString(),
    hsl: c.toHslString(),
    hsv: JSON.stringify(c.toHsv()),
    oklch: c.toLchString(),
  };
};

export const generateCssVariables = (
  colors: string[],
  format: "hex" | "rgb" | "hsl" | "oklch"
) => {
  if (colors.length === 0) return "";

  let css = ":root {\n";

  colors.forEach((color, index) => {
    const c = colord(color);
    let value = "";

    switch (format) {
      case "hex":
        value = c.toHex();
        break;
      case "rgb":
        value = c.toRgbString();
        break;
      case "hsl":
        value = c.toHslString();
        break;
      case "oklch":
        const lch = c.toLch();
        value = `oklch(${lch.l} ${lch.c} ${lch.h}${
          lch.a !== 1 ? ` / ${lch.a}` : ""
        })`;
        break;
    }

    css += `  --color-${index + 1}: ${value};\n`;
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
    const c = colord(color);
    config += `        color${index + 1}: "${c.toHex()}",\n`;
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
  }
) => {
  setIsExtracting(true);
  toast.loading("Extracting colors...");

  // Create URL for image preview
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
            .map(([r, g, b]) => colord({ r, g, b }).toHex())
            .filter((color) => {
              return !colors.some((existingColor: string) => {
                const c1 = colord(color);
                const c2 = colord(existingColor);
                const distance = Math.sqrt(
                  Math.pow(c1.toRgb().r - c2.toRgb().r, 2) +
                    Math.pow(c1.toRgb().g - c2.toRgb().g, 2) +
                    Math.pow(c1.toRgb().b - c2.toRgb().b, 2)
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
