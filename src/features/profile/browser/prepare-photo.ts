import { isLocalPhoto } from "../domain/photo";
export async function preparePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Foto tidak valid. Pilih JPG, PNG, atau WebP maksimal 5 MB.");
  let image: ImageBitmap;
  try { image = await createImageBitmap(file); } catch { throw new Error("Foto belum dapat diproses. Coba gambar lain."); }
  try {
    if (!image.width || !image.height || image.width * image.height > 20_000_000) throw new Error("Foto terlalu besar. Pilih gambar yang lebih kecil.");
    const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Foto belum dapat diproses. Coba gambar lain.");
    const size = Math.min(image.width, image.height);
    context.fillStyle = "white"; context.fillRect(0, 0, 256, 256);
    context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 256, 256);
    const data = canvas.toDataURL("image/jpeg", 0.8);
    if (!isLocalPhoto(data)) throw new Error("Foto belum dapat diproses. Coba gambar lain.");
    return data;
  } finally { image.close(); }
}
