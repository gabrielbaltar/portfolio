/**
 * Image compression utility for localStorage-based CMS.
 * Resizes and compresses images to stay within localStorage quota (~5MB total).
 */

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 0.75;
const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500KB target per image

type LoadedImage = {
  element: HTMLImageElement;
  width: number;
  height: number;
};

export type SquareImageCropConfig = {
  x: number;
  y: number;
  zoom: number;
  viewportSize: number;
  outputSize?: number;
  mimeType?: string;
  quality?: number;
  backgroundColor?: string;
};

function loadImageFromFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        element: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Nao foi possivel carregar a imagem para o recorte."));
    };

    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Nao foi possivel gerar a imagem recortada."));
        return;
      }

      resolve(blob);
    }, mimeType, quality);
  });
}

function buildDerivedImageName(fileName: string, mimeType: string): string {
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const baseName = fileName.replace(/\.[^.]+$/, "") || "profile-photo";
  return `${baseName}-crop.${extension}`;
}

/**
 * Compress an image file using canvas.
 * Returns a smaller base64 data URL (JPEG).
 */
export function compressImage(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<string> {
  const maxW = options?.maxWidth ?? MAX_WIDTH;
  const maxH = options?.maxHeight ?? MAX_HEIGHT;
  const quality = options?.quality ?? JPEG_QUALITY;

  return new Promise((resolve, reject) => {
    // SVGs: read as text/data URL without compression
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read SVG"));
      reader.readAsDataURL(file);
      return;
    }

    // GIFs: preserve animation — read as-is without canvas (canvas kills animation)
    if (file.type === "image/gif") {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read GIF"));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Use better interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // For PNGs with transparency, keep as PNG but compressed
      // For everything else, use JPEG for much smaller size
      const isPng = file.type === "image/png";
      let result: string;

      if (isPng) {
        // Try JPEG first, if much smaller use it
        const jpegResult = canvas.toDataURL("image/jpeg", quality);
        const pngResult = canvas.toDataURL("image/png");

        // Use JPEG if it's significantly smaller (common for photos saved as PNG)
        result = jpegResult.length < pngResult.length * 0.7 ? jpegResult : pngResult;

        // If still too large, force JPEG with lower quality
        if (result.length > MAX_FILE_SIZE_BYTES * 1.37) {
          // base64 is ~37% larger than binary
          result = canvas.toDataURL("image/jpeg", 0.6);
        }
      } else {
        result = canvas.toDataURL("image/jpeg", quality);

        // Progressive quality reduction if still too large
        if (result.length > MAX_FILE_SIZE_BYTES * 1.37) {
          result = canvas.toDataURL("image/jpeg", 0.5);
        }
        if (result.length > MAX_FILE_SIZE_BYTES * 1.37) {
          // Reduce dimensions further
          const smallerCanvas = document.createElement("canvas");
          smallerCanvas.width = Math.round(width * 0.7);
          smallerCanvas.height = Math.round(height * 0.7);
          const sCtx = smallerCanvas.getContext("2d");
          if (sCtx) {
            sCtx.imageSmoothingEnabled = true;
            sCtx.imageSmoothingQuality = "high";
            sCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
            result = smallerCanvas.toDataURL("image/jpeg", 0.6);
          }
        }
      }

      resolve(result);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}

/**
 * Compress an existing base64 data URL string.
 * Useful for re-compressing images that are already in memory.
 */
export function compressDataUrl(
  dataUrl: string,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<string> {
  const maxW = options?.maxWidth ?? MAX_WIDTH;
  const maxH = options?.maxHeight ?? MAX_HEIGHT;
  const quality = options?.quality ?? JPEG_QUALITY;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl); // fallback to original
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => reject(new Error("Failed to compress data URL"));
    img.src = dataUrl;
  });
}

/**
 * Estimate localStorage usage in bytes.
 */
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  let used = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }
  } catch {
    // ignore
  }
  // localStorage typically allows ~5MB (characters, so ~10MB in UTF-16)
  const total = 5 * 1024 * 1024; // ~5MB in characters
  return {
    used,
    total,
    percentage: Math.round((used / total) * 100),
  };
}

/**
 * Check if a string is a base64 data URL
 */
export function isBase64DataUrl(str: string): boolean {
  return typeof str === "string" && str.startsWith("data:");
}

/**
 * Get approximate size of a base64 data URL in KB
 */
export function getBase64SizeKB(dataUrl: string): number {
  if (!isBase64DataUrl(dataUrl)) return 0;
  // Remove the data URL header
  const base64 = dataUrl.split(",")[1] || "";
  // Base64 encodes 3 bytes as 4 chars
  return Math.round((base64.length * 3) / 4 / 1024);
}

export async function createSquareCroppedImageFile(
  file: File,
  config: SquareImageCropConfig,
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione uma imagem valida para recortar.");
  }

  if (!config.viewportSize || config.viewportSize <= 0) {
    throw new Error("A area de recorte ainda nao esta pronta.");
  }

  const loaded = await loadImageFromFile(file);
  const outputSize = Math.max(256, Math.round(config.outputSize ?? 1080));
  const mimeType = config.mimeType ?? (file.type === "image/png" ? "image/png" : "image/jpeg");
  const quality = config.quality ?? 0.92;
  const baseScale = Math.max(outputSize / loaded.width, outputSize / loaded.height);
  const renderedWidth = loaded.width * baseScale * config.zoom;
  const renderedHeight = loaded.height * baseScale * config.zoom;
  const offsetScale = outputSize / config.viewportSize;
  const drawX = (outputSize - renderedWidth) / 2 + config.x * offsetScale;
  const drawY = (outputSize - renderedHeight) / 2 + config.y * offsetScale;

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas indisponivel para gerar a imagem recortada.");
  }

  if (mimeType === "image/jpeg") {
    context.fillStyle = config.backgroundColor ?? "#ffffff";
    context.fillRect(0, 0, outputSize, outputSize);
  } else {
    context.clearRect(0, 0, outputSize, outputSize);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(loaded.element, drawX, drawY, renderedWidth, renderedHeight);

  const blob = await canvasToBlob(
    canvas,
    mimeType,
    mimeType === "image/png" ? undefined : quality,
  );

  return new File([blob], buildDerivedImageName(file.name, mimeType), {
    type: mimeType,
    lastModified: Date.now(),
  });
}
