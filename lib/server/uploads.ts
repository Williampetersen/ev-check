const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function fileToDataUrl(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Billedet skal være PNG, JPEG, WEBP eller SVG.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Billedet er for stort. Maks 3 MB.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}
