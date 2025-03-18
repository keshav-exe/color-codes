declare module "colorthief" {
  type RGB = [number, number, number];

  export default class ColorThief {
    /**
     * Get 8-bit RGB color values from image
     */
    getColor(img: HTMLImageElement): RGB;

    /**
     * Get a color palette from an image.
     * @param img - Image element
     * @param colorCount - Number of colors to retrieve
     * @param quality - Quality (higher is better but slower, 1-10)
     */
    getPalette(
      img: HTMLImageElement,
      colorCount?: number,
      quality?: number
    ): RGB[];
  }
}
