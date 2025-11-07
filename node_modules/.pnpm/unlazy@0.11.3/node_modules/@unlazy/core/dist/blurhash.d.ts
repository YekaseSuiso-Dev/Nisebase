interface BlurHashOptions {
    /**
     * Aspect ratio (width / height) of the BlurHash image to be decoded.
     *
     * @default 1 (square aspect ratio)
     */
    ratio?: number;
    /**
     * The size of the longer edge (width or height) of the BlurHash image to be
     * decoded, depending on the aspect ratio.
     *
     * @default 32
     */
    size?: number;
}
declare function createPngDataUri(hash: string, { ratio, size, }?: BlurHashOptions): string;

export { type BlurHashOptions, createPngDataUri };
