declare module "gifenc" {
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][],
  ): Uint8Array;

  export function GIFEncoder(): {
    bytes(): Uint8Array;
    finish(): void;
    writeFrame(
      indexed: Uint8Array,
      width: number,
      height: number,
      options?: { delay?: number; palette?: number[][]; repeat?: number },
    ): void;
  };

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
  ): number[][];
}

declare module "pngjs" {
  export class PNG {
    data: Buffer;
    height: number;
    width: number;

    static sync: {
      read(buffer: Buffer): PNG;
    };
  }
}
