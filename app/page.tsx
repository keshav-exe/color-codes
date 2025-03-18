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
import {
  ArrowLeft,
  Copy,
  Download,
  Github,
  GithubIcon,
  Trash2,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";
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

extend([lchPlugin]);

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    colors,
    currentColor,
    uploadedImage,
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
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addColor(currentColor);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", {
      description: "Color code copied to clipboard",
    });
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
        content = generateCssVariables(colors, "hex");
        break;
      case "css-rgb":
        content = generateCssVariables(colors, "rgb");
        break;
      case "css-hsl":
        content = generateCssVariables(colors, "hsl");
        break;
      case "tailwind-config":
        content = generateTailwindConfig(colors);
        break;
    }

    copyToClipboard(content);
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
    setShowReplaceDialog(false);
    setPendingFile(null);
    removeAllColors();
  };

  return (
    <main className="container mx-auto max-w-3xl lg:border-x border-dashed min-h-screen flex flex-col h-full">
      <div className="flex flex-col">
        <div className="flex justify-between border-b border-dashed p-4 lg:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">color codes</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Link
                href="https://github.com/keshav-exe/color-codes"
                target="_blank"
                className="!text-primary flex items-center gap-2"
              >
                <GithubIcon className="h-4 w-4" />
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </div>

        <div className="p-4 lg:p-8 border-b border-dashed flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="(hex, rgb, hsl, hsv, oklch)"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                autoFocus
              />

              <Button
                onClick={() => addColor(currentColor)}
                disabled={!currentColor}
              >
                save
              </Button>
            </div>

            <span className="text-muted-foreground text-sm text-center">
              or
            </span>
            <div className="flex flex-col gap-4">
              <div
                className="flex items-center gap-2 border border-dashed h-[200px] justify-center rounded-md cursor-pointer relative overflow-hidden"
                onClick={() => {
                  if (uploadedImage) {
                    setShowReplaceDialog(true);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  if (uploadedImage) return;
                  e.preventDefault();
                  e.currentTarget.classList.add("border-primary");
                }}
                onDragLeave={(e) => {
                  if (uploadedImage) return;
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-primary");
                }}
                onDrop={(e) => {
                  if (uploadedImage) return;
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-primary");
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) {
                    const input = fileInputRef.current;
                    if (input) {
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      input.files = dataTransfer.files;
                      handleInputFileChange({ target: input } as any);
                    }
                  } else {
                    toast.error("please drop an image file");
                  }
                }}
              >
                <Input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleInputFileChange}
                  className="hidden"
                  id="image-upload"
                  disabled={isExtracting}
                />

                <div
                  className="relative group h-full flex items-center justify-center"
                  style={{ maxHeight: "200px" }}
                >
                  {uploadedImage ? (
                    <>
                      <p className="text-sm text-center group-hover:opacity-100 opacity-50 transition-all duration-300  z-[1] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-50">
                        replace image
                      </p>
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-0" />
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center">
                      extract colors from image
                    </p>
                  )}
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="uploaded for color extraction"
                      className="w-full h-auto"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {colors.length > 0 && (
          <div className="relative pb-32">
            {showExport ? (
              <>
                <div className="flex justify-between items-center p-4 lg:px-8 border-b border-dashed sticky top-0 bg-background">
                  <Button
                    className="flex items-center gap-1"
                    onClick={() => setShowExport(!showExport)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    back
                  </Button>
                </div>

                <div className="p-4 lg:p-8 border-b border-dashed">
                  <Tabs defaultValue="tailwind-config">
                    <TabsList className="w-full">
                      <TabsTrigger value="tailwind-config">
                        tailwind config
                      </TabsTrigger>
                      <TabsTrigger value="css-hex">css hex</TabsTrigger>
                      <TabsTrigger value="css-rgb">css rgb</TabsTrigger>
                      <TabsTrigger value="css-hsl">css hsl</TabsTrigger>
                      <TabsTrigger value="css-oklch">css oklch</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tailwind-config" className="relative">
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => exportColors("tailwind-config")}
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
              </>
            ) : (
              <>
                <div className="flex justify-between items-center p-4 lg:px-8 border-b border-dashed sticky top-0 bg-background">
                  <h2 className="text-xl font-semibold">
                    {colors.length} colors
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
                <div className="border-b p-4 lg:p-8 border-dashed">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {colors.map((color: string, index: number) => {
                      const formats = getColorFormats(color);
                      return (
                        <div
                          key={index}
                          className="overflow-hidden bg-card border rounded-md"
                        >
                          <div
                            className="h-20 w-full"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex items-center justify-between p-3 border-b border-dashed gap-2">
                            <Input
                              value={`color ${index + 1}`}
                              onChange={(e) =>
                                setColorName(index, e.target.value)
                              }
                            />
                            <Button
                              variant="outline"
                              onClick={() => removeColor(index)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <div className="flex flex-col divide-y divide-dashed">
                              {Object.entries(formats).map(
                                ([format, value]) => (
                                  <div
                                    key={format}
                                    className="flex flex-col gap-2 p-3"
                                  >
                                    <span className="text-xs text-muted-foreground font-medium uppercase">
                                      {format}:
                                    </span>
                                    <div className="flex gap-2 items-center justify-between bg-muted rounded-md">
                                      <span className="font-mono text-sm p-2">
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <footer className="border-t items-center justify-center border-dashed p-4 mt-auto z-50">
        <p className="text-muted-foreground text-sm text-center">
          Find me on{" "}
          <Link
            href="https://x.com/kshvbgde"
            target="_blank"
            className="!text-primary"
          >
            X
          </Link>
        </p>
      </footer>

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
