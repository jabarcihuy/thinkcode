export const MAX_PHOTO_DATA_LENGTH = 180_000;
export function isCloudPhoto(value: string): boolean {
  return /^https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\/[\w/.,-]+$/.test(value);
}
export function isLocalPhoto(value: string): boolean {
  return value.length <= MAX_PHOTO_DATA_LENGTH && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(value);
}
/** Accept only bounded 256px JPEGs produced by our browser image preparation. */
export function decodePhoto(value: string): Uint8Array | null {
  if (!isLocalPhoto(value)) return null;
  let binary: Uint8Array;
  try { binary = Uint8Array.from(atob(value.split(",")[1]!), character => character.charCodeAt(0)); } catch { return null; }
  if (binary.length > 135_000 || binary[0] !== 255 || binary[1] !== 216) return null;
  let offset = 2;
  while (offset + 8 < binary.length) {
    if (binary[offset] !== 255) return null;
    const marker = binary[offset + 1]!;
    if (marker === 218 || marker === 217) return null;
    const length = binary[offset + 2]! * 256 + binary[offset + 3]!;
    if (length < 2 || offset + 2 + length > binary.length) return null;
    if (marker === 192 || marker === 193 || marker === 194) {
      if (length < 8) return null;
      const height = binary[offset + 5]! * 256 + binary[offset + 6]!;
      const width = binary[offset + 7]! * 256 + binary[offset + 8]!;
      return width === 256 && height === 256 ? binary : null;
    }
    offset += length + 2;
  }
  return null;
}
