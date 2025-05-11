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
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { Separator } from "@/components/ui/separator";
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
                  convert to various formats.
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
                <div className="flex flex-col gap-2 p-4 lg:p-8 ">
                  <Label htmlFor="color-input">color code</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="(hex, rgb, hsl, hsv, oklch)"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className=""
                      autoFocus
                    />
                    <Button
                      onClick={() => addColor(currentColor)}
                      disabled={!currentColor}
                      className="w-fit"
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
            <div className="flex flex-col gap-4 w-full border-x border-dashed max-w-4xl mx-auto h-full">
              <div className="relative pb-32 h-full">
                {showExport ? (
                  <div className="flex flex-col gap-4 p-4 lg:p-8 ">
                    <div className="flex justify-between items-center sticky top-0 bg-background">
                      <Button
                        onClick={() => setShowExport(!showExport)}
                        size="icon"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </div>

                    <Tabs defaultValue="tailwind">
                      <TabsList className=" items-center">
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
                    <div className="flex justify-between items-center sticky top-16 p-4 lg:px-8 bg-background border-b border-dashed">
                      <h2 className="text-xl font-semibold">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-8">
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
                            <div className="flex items-center justify-between p-3 gap-2">
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
