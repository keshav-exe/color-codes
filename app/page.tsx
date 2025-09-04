"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { useColorStore } from "./store/colorStore";
import {
  getColorFormats,
  generateAdvancedCssVariables,
  generateTailwindConfig,
  handleFileUpload,
} from "./utils/colorUtils";
import { generateColors } from "./utils/colorUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowUpIcon,
  Copy,
  PaperclipIcon,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    colors,
    currentColor,
    isExtracting,
    showExport,
    setCurrentColor,
    addColor,
    removeColor,
    removeAllColors,
    setUploadedImage,
    setIsExtracting,
    setShowExport,
    setColorName,
    colorNames,
  } = useColorStore();

  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [generatorType, setGeneratorType] = useState<
    "palette" | "scheme" | "swatch"
  >("palette");
  const [generatorOptions, setGeneratorOptions] = useState({
    paletteType: "analogous" as const,
    schemeType: "complementary" as const,
  });
  const [generatedColors, setGeneratedColors] = useState<string[]>([]);
  const [generatorModal, setGeneratorModal] = useState<{
    isOpen: boolean;
    type: "palette" | "scheme" | "swatch";
    baseColor: string;
  }>({
    isOpen: false,
    type: "palette",
    baseColor: "",
  });

  // Add these state variables for individual generator options
  const [paletteType, setPaletteType] = useState<
    "analogous" | "monochromatic" | "complementary" | "triadic"
  >("analogous");
  const [schemeType, setSchemeType] = useState<
    "analogous" | "complementary" | "triadic"
  >("complementary");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addColor(currentColor);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("code copied to clipboard");
  };

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFileUpload(file, {
      setIsExtracting,
      setUploadedImage,
      colors,
      addColor,
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const exportColors = (type: string) => {
    let content = "";

    switch (type) {
      case "css-hex":
        content = generateAdvancedCssVariables(colors, {
          format: "hex",
          useModernSyntax: true,
        });
        break;
      case "css-rgb":
        content = generateAdvancedCssVariables(colors, {
          format: "rgb",
          useModernSyntax: true,
        });
        break;
      case "css-hsl":
        content = generateAdvancedCssVariables(colors, {
          format: "hsl",
          useModernSyntax: true,
        });
        break;
      case "css-oklch":
        content = generateAdvancedCssVariables(colors, {
          format: "oklch",
          useModernSyntax: true,
        });
        break;
      case "tailwind":
        content = generateTailwindConfig(colors);
        break;
    }

    copyToClipboard(content);
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
    setShowReplaceDialog(false);
    removeAllColors();
  };

  const handleGenerate = () => {
    if (!currentColor) {
      toast.error("Enter a base color first");
      return;
    }

    try {
      const generated = generateColors(
        currentColor,
        generatorType,
        generatorOptions,
      );
      generated.forEach((color) => addColor(color));
      toast.success(`Generated ${generated.length} colors`);
    } catch (error) {
      toast.error("Failed to generate colors");
    }
  };

  const handleColorGenerate = (
    color: string,
    type: "palette" | "scheme" | "swatch",
  ) => {
    try {
      let generated: string[] = [];

      switch (type) {
        case "palette":
          generated = generateColors(color, "palette", {
            paletteType: paletteType,
          });
          break;
        case "scheme":
          generated = generateColors(color, "scheme", {
            schemeType: schemeType,
          });
          break;
        case "swatch":
          generated = generateColors(color, "swatch");
          break;
      }

      setGeneratedColors(generated);
      setGeneratorModal({ isOpen: true, type, baseColor: color });
    } catch (error) {
      toast.error(`Failed to generate ${type}`);
    }
  };

  // Focus input when window gains focus
  useEffect(() => {
    const handleWindowFocus = () => {
      inputRef.current?.focus();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col h-full w-full justify-end">
      <div className="flex flex-col mx-auto w-full h-full">
        {colors.length > 0 && (
          <div className="flex flex-col mx-auto w-full border-dashed h-full ">
            <div className="flex flex-col gap-4 w-full border-x border-dashed max-w-4xl mx-auto h-full min-h-screen">
              <div className="relative flex flex-col h-full">
                {showExport ? (
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center sticky top-0 p-4 lg:px-8 bg-background border-b border-dashed z-20">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => setShowExport(!showExport)}
                          variant="ghost"
                          size="icon"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2>Export CSS</h2>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 p-4 lg:p-6">
                      <Tabs defaultValue="tailwind" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="tailwind" className="text-xs">
                            tailwind
                          </TabsTrigger>
                          <TabsTrigger value="css-hex" className="text-xs">
                            hex
                          </TabsTrigger>
                          <TabsTrigger value="css-rgb" className="text-xs">
                            rgb
                          </TabsTrigger>
                          <TabsTrigger value="css-hsl" className="text-xs">
                            hsl
                          </TabsTrigger>
                          <TabsTrigger value="css-oklch" className="text-xs">
                            oklch
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tailwind" className="mt-4">
                          <div className="border border-dashed overflow-hidden">
                            <div className="flex items-center justify-between p-3 border-b border-dashed bg-card">
                              <span className="text-sm font-medium">
                                Tailwind CSS Config
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportColors("tailwind")}
                                className="flex items-center gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </Button>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-sm">
                              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                                <code>{generateTailwindConfig(colors)}</code>
                              </pre>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="css-hex" className="mt-4">
                          <div className="border border-dashed overflow-hidden">
                            <div className="flex items-center justify-between p-3 border-b border-dashed bg-card">
                              <span className="text-sm font-medium">
                                CSS Variables (HEX)
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportColors("css-hex")}
                                className="flex items-center gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </Button>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-sm">
                              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                                <code>
                                  {generateAdvancedCssVariables(colors, {
                                    format: "hex",
                                    useModernSyntax: true,
                                  })}
                                </code>
                              </pre>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="css-rgb" className="mt-4">
                          <div className="border border-dashed overflow-hidden">
                            <div className="flex items-center justify-between p-3 border-b border-dashed bg-card">
                              <span className="text-sm font-medium">
                                CSS Variables (RGB)
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportColors("css-rgb")}
                                className="flex items-center gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </Button>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-sm">
                              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                                <code>
                                  {generateAdvancedCssVariables(colors, {
                                    format: "rgb",
                                    useModernSyntax: true,
                                  })}
                                </code>
                              </pre>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="css-hsl" className="mt-4">
                          <div className="border border-dashed overflow-hidden">
                            <div className="flex items-center justify-between p-3 border-b border-dashed bg-card">
                              <span className="text-sm font-medium">
                                CSS Variables (HSL)
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportColors("css-hsl")}
                                className="flex items-center gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </Button>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-sm">
                              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                                <code>
                                  {generateAdvancedCssVariables(colors, {
                                    format: "hsl",
                                    useModernSyntax: true,
                                  })}
                                </code>
                              </pre>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="css-oklch" className="mt-4">
                          <div className="border border-dashed overflow-hidden">
                            <div className="flex items-center justify-between p-3 border-b border-dashed bg-card">
                              <span className="text-sm font-medium">
                                CSS Variables (OKLCH)
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => exportColors("css-oklch")}
                                className="flex items-center gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </Button>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-sm">
                              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                                <code>
                                  {generateAdvancedCssVariables(colors, {
                                    format: "oklch",
                                    useModernSyntax: true,
                                  })}
                                </code>
                              </pre>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center sticky top-0 p-4 lg:px-8 bg-background border-b border-dashed z-20">
                      <h2>
                        {colors.length} color{colors.length > 1 ? "s" : ""}
                      </h2>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            removeAllColors();
                            toast("All colors discarded");
                          }}
                          className="flex items-center hover:text-destructive gap-1"
                        >
                          clear
                        </Button>

                        <Button
                          className="flex items-center gap-1"
                          onClick={() => setShowExport(!showExport)}
                        >
                          export css
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-6">
                      {colors.map((color: string, index: number) => {
                        const formats = getColorFormats(color);
                        return (
                          <div
                            key={index}
                            className="overflow-hidden border border-dashed"
                          >
                            <div className="flex items-center justify-between p-2 gap-2 border-b border-dashed relative bg-card">
                              <input
                                value={
                                  colorNames[index] || `color ${index + 1}`
                                }
                                onChange={(e) =>
                                  setColorName(index, e.target.value)
                                }
                                onBlur={(e) => {
                                  if (!e.target.value.trim()) {
                                    setColorName(index, `color ${index + 1}`);
                                  }
                                }}
                                className="border-none focus:ring-0 focus:ring-offset-0 focus:outline-none w-full"
                              />
                              <Button
                                variant="ghost"
                                onClick={() => removeColor(index)}
                                className="text-muted-foreground hover:text-destructive absolute right-2 "
                                size="icon"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div
                              className="h-10 w-full border-b border-dashed"
                              style={{ backgroundColor: color }}
                            />

                            <div>
                              <div className="flex flex-col divide-y divide-dashed">
                                {Object.entries(formats).map(
                                  ([format, value]) => (
                                    <div
                                      key={format}
                                      className="flex items-center gap-1 p-2"
                                    >
                                      <span className="text-xs text-muted-foreground font-medium uppercase">
                                        {format}:
                                      </span>
                                      <div className="flex gap-2 items-center justify-between w-full">
                                        <span className="font-mono text-sm">
                                          {value}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => copyToClipboard(value)}
                                        >
                                          <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* Add generator buttons */}
                              <div className="border-t border-dashed">
                                <div className="grid grid-cols-3">
                                  <Button
                                    variant="ghost"
                                    className="border-r border-dashed"
                                    onClick={() =>
                                      handleColorGenerate(color, "palette")
                                    }
                                  >
                                    palette
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="border-r border-dashed"
                                    onClick={() =>
                                      handleColorGenerate(color, "scheme")
                                    }
                                  >
                                    scheme
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={() =>
                                      handleColorGenerate(color, "swatch")
                                    }
                                  >
                                    swatch
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col mx-auto w-full border-t border-dashed sticky bottom-0 bg-background/85 backdrop-blur-lg mt-auto">
          <div className="flex flex-col gap-4 w-full border-x border-dashed max-w-4xl mx-auto">
            <div className="flex gap-2 p-4 lg:p-6">
              <input
                ref={inputRef}
                className="w-full border-none focus:ring-0 focus:ring-offset-0 focus:outline-none"
                type="text"
                placeholder="(hex, rgb, hsl, hsv, oklch)"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <ModeToggle />
                <div>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleInputFileChange}
                    id="image-upload"
                    disabled={isExtracting}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtracting}
                    variant="ghost"
                    size="icon"
                  >
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => addColor(currentColor)}
                  disabled={!currentColor}
                  variant="outline"
                  size="icon"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Image</DialogTitle>
            <DialogDescription>
              This will clear all existing colors. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReplaceDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReplace}>Replace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={generatorModal.isOpen}
        onOpenChange={(open) =>
          setGeneratorModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {generatorModal.type} from {generatorModal.baseColor}
            </DialogTitle>
            <DialogDescription>
              {generatorModal.type === "palette" &&
                `${paletteType} color palette`}
              {generatorModal.type === "scheme" && `${schemeType} color scheme`}
              {generatorModal.type === "swatch" &&
                "Color swatch from light to dark"}
            </DialogDescription>
          </DialogHeader>

          {/* Add generator options */}
          <div className="flex gap-4">
            {generatorModal.type === "palette" && (
              <div className="flex-1 mb-4 flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                  Palette Type
                </Label>
                <select
                  value={paletteType}
                  onChange={(e) => {
                    setPaletteType(e.target.value as any);
                    handleColorGenerate(generatorModal.baseColor, "palette");
                  }}
                  className="w-full p-2 border border-dashed rounded text-sm bg-background"
                >
                  <option value="analogous">Analogous</option>
                  <option value="monochromatic">Monochromatic</option>
                  <option value="complementary">Complementary</option>
                  <option value="triadic">Triadic</option>
                </select>
              </div>
            )}

            {generatorModal.type === "scheme" && (
              <div className="flex-1 mb-4 flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                  Scheme Type
                </Label>
                <select
                  value={schemeType}
                  onChange={(e) => {
                    setSchemeType(e.target.value as any);
                    handleColorGenerate(generatorModal.baseColor, "scheme");
                  }}
                  className="w-full p-2 border border-dashed rounded text-sm bg-background"
                >
                  <option value="complementary">Complementary</option>
                  <option value="analogous">Analogous</option>
                  <option value="triadic">Triadic</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {generatedColors.map((genColor, idx) => (
              <div key={idx} className="border border-dashed overflow-hidden">
                <div
                  className="h-16 w-full border-b border-dashed"
                  style={{ backgroundColor: genColor }}
                />
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{genColor}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(genColor)}
                      className="h-6 w-6"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setGeneratorModal((prev) => ({ ...prev, isOpen: false }))
              }
            >
              close
            </Button>
            <Button
              onClick={() => {
                generatedColors.forEach((color) => addColor(color));
                toast.success(`Added ${generatedColors.length} colors`);
                setGeneratorModal((prev) => ({ ...prev, isOpen: false }));
              }}
            >
              add all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
