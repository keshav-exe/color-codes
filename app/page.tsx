"use client";

import { useRef, useState } from "react";
import { extend } from "colord";
import lchPlugin from "colord/plugins/lch";
import { toast } from "sonner";
import { useColorStore } from "./store/colorStore";
import {
  getColorFormats,
  generateCssVariables,
  generateTailwindConfig,
  handleFileUpload,
} from "./utils/colorUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download, GithubIcon, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
extend([lchPlugin]);

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  } = useColorStore();

  const [showReplaceDialog, setShowReplaceDialog] = useState(false);

  // NEW: single global format selector (hex | rgb | hsl | hsv | oklch)
  const [selectedFormat, setSelectedFormat] = useState<
    "hex" | "rgb" | "hsl" | "hsv" | "oklch"
  >("hex");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addColor(currentColor);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", { description: "Copied to clipboard" });
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

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportColors = (type: string) => {
    let content = "";
    switch (type) {
      case "css-hex":
        content = generateCssVariables(colors, "hex");
        break;
      case "css-rgb":
        content = generateCssVariables(colors, "rgb");
        break;
      case "css-hsl":
        content = generateCssVariables(colors, "hsl");
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

  return (
    <main className="min-h-screen flex flex-col h-full w-full">
      <div className="flex flex-col mx-auto w-full h-full">
        <div className="flex flex-col mx-auto w-full border-b border-dashed">
          <div className="flex flex-col gap-4 w-full border-x border-dashed max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col gap-4 p-4 lg:p-8">
                <h1 className="text-2xl font-semibold">Color Codes</h1>
                <p className="text-sm text-muted-foreground">
                  Convert color codes or extract color codes from images and
                  export to various formats.
                </p>
                <div className="flex gap-2">
                  <Link href="https://x.com/kshvbgde" target="_blank">
                    <Button size="icon" variant="secondary">
                      <FaXTwitter />
                    </Button>
                  </Link>
                  <Link
                    href="https://github.com/keshav-exe/color-codes"
                    target="_blank"
                  >
                    <Button size="icon" variant="secondary">
                      <FaGithub />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-dashed">
                <div className="flex flex-col gap-2 p-4 lg:p-8">
                  <Label htmlFor="color-input">color code</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="(hex, rgb, hsl, hsv, oklch)"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <Button
                      onClick={() => addColor(currentColor)}
                      disabled={!currentColor}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="border-b border-dashed" />

                <div className="flex flex-col gap-2 p-4 lg:p-8">
                  <Label htmlFor="image-upload">upload image</Label>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleInputFileChange}
                    id="image-upload"
                    disabled={isExtracting}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {colors.length > 0 && (
          <div className="flex flex-col mx-auto w-full border-b border-dashed h-full">
            <div className="flex flex-col gap-4 w-full border-x border-dashed max-w-5xl mx-auto h-full">
              <div className="relative pb-24 h-full">
                {showExport ? (
                  <div className="flex flex-col gap-4 p-4 lg:p-8">
                    <div className="flex justify-between items-center sticky top-0 bg-background">
                      <Button
                        onClick={() => setShowExport(!showExport)}
                        size="icon"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </div>

                    <Tabs defaultValue="tailwind">
                      <TabsList className="items-center">
                        <TabsTrigger value="tailwind">tailwind</TabsTrigger>
                        <TabsTrigger value="css-hex">hex</TabsTrigger>
                        <TabsTrigger value="css-rgb">rgb</TabsTrigger>
                        <TabsTrigger value="css-hsl">hsl</TabsTrigger>
                        <TabsTrigger value="css-oklch">oklch</TabsTrigger>
                      </TabsList>
                      <TabsContent value="tailwind" className="relative">
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => exportColors("tailwind")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <SyntaxHighlighter
                          language="css"
                          style={oneDark}
                          customStyle={{ fontSize: "12px", margin: 0 }}
                        >
                          {generateTailwindConfig(colors)}
                        </SyntaxHighlighter>
                      </TabsContent>
                      <TabsContent value="css-hex" className="relative">
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => exportColors("css-hex")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <SyntaxHighlighter
                          language="css"
                          style={oneDark}
                          customStyle={{ fontSize: "12px", margin: 0 }}
                        >
                          {generateCssVariables(colors, "hex")}
                        </SyntaxHighlighter>
                      </TabsContent>
                      <TabsContent value="css-rgb" className="relative">
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => exportColors("css-rgb")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <SyntaxHighlighter
                          language="css"
                          style={oneDark}
                          customStyle={{ fontSize: "12px", margin: 0 }}
                        >
                          {generateCssVariables(colors, "rgb")}
                        </SyntaxHighlighter>
                      </TabsContent>
                      <TabsContent value="css-hsl" className="relative">
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => exportColors("css-hsl")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <SyntaxHighlighter
                          language="css"
                          style={oneDark}
                          customStyle={{ fontSize: "12px", margin: 0 }}
                        >
                          {generateCssVariables(colors, "hsl")}
                        </SyntaxHighlighter>
                      </TabsContent>
                      <TabsContent value="css-oklch" className="relative">
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => exportColors("css-oklch")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <SyntaxHighlighter
                          language="css"
                          style={oneDark}
                          customStyle={{ fontSize: "12px", margin: 0 }}
                        >
                          {generateCssVariables(colors, "oklch")}
                        </SyntaxHighlighter>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Toolbar with global selector and actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 sticky top-16 p-4 lg:px-8 bg-background border-b border-dashed">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold">
                          {colors.length} color{colors.length > 1 ? "s" : ""}
                        </h2>

                        {/* Global format selector (like shadcn/colors) */}
                        <Select
                          value={selectedFormat}
                          onValueChange={(v) =>
                            setSelectedFormat(v as typeof selectedFormat)
                          }
                        >
                          <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hex">HEX</SelectItem>
                            <SelectItem value="rgb">RGB</SelectItem>
                            <SelectItem value="hsl">HSL</SelectItem>
                            <SelectItem value="hsv">HSV</SelectItem>
                            <SelectItem value="oklch">OKLCH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            removeAllColors();
                            toast("All colors discarded");
                          }}
                          className="flex items-center hover:text-destructive gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          discard
                        </Button>

                        <Button
                          className="flex items-center gap-1"
                          onClick={() => setShowExport(!showExport)}
                        >
                          <Download className="h-4 w-4" />
                          export
                        </Button>
                      </div>
                    </div>

                    {/* Single-row scrollable palette, like your screenshot */}
                    <div className="w-full overflow-x-auto">
                      <div
                        className="
                          flex gap-3 px-4 lg:px-8 pb-6
                          min-w-max
                        "
                      >
                        {colors.map((color: string, index: number) => {
                          const formats = getColorFormats(color);
                          const text =
                            formats[selectedFormat as keyof typeof formats];

                          return (
                            <div
                              key={index}
                              className="
                                group relative shrink-0
                                w-[130px] sm:w-[150px] md:w-[160px]
                              "
                            >
                              {/* Swatch card */}
                              <div
                                className="
                                  aspect-[3/4] w-full overflow-hidden
                                  rounded-xl border border-border/60
                                  bg-card shadow-sm
                                "
                              >
                                {/* Color preview fills most of the card, rounded like the image */}
                                <div
                                  className="
                                    h-full w-full
                                    rounded-xl
                                    cursor-pointer
                                    transition-transform
                                    group-hover:scale-[1.015]
                                  "
                                  style={{ backgroundColor: color }}
                                  onClick={() => copyToClipboard(text)}
                                  title="Click to copy"
                                />
                              </div>

                              {/* Caption under swatch: name + value in selected format */}
                              <div className="mt-2 px-1">
                                <div className="flex items-center justify-between gap-2">
                                  <Input
                                    value={`color ${index + 1}`}
                                    onChange={(e) =>
                                      setColorName(index, e.target.value)
                                    }
                                    className="
                                      h-7 text-xs border-none bg-transparent p-0
                                      focus-visible:ring-0
                                    "
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeColor(index)}
                                    className="
                                      h-6 w-6 text-muted-foreground
                                      hover:text-destructive opacity-0
                                      group-hover:opacity-100 transition-opacity
                                    "
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                <button
                                  className="
                                    mt-1 w-full text-left font-mono text-[11px]
                                    text-muted-foreground bg-muted/30
                                    rounded px-2 py-1
                                    hover:bg-muted/50 transition-colors
                                  "
                                  onClick={() => copyToClipboard(text)}
                                  title="Click to copy"
                                >
                                  {text}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
    </main>
  );
}
