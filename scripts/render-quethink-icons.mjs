/** Derive web and Android PNG exports from the new standalone SVG master. */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const source = await readFile("public/assets/quethink/app-icon.svg", "utf8");
const exports = new Map([
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
  ["public/icons/icon-maskable-512.png", 512],
  ["public/icons/apple-touch-icon.png", 180],
]);
for (const directory of ["android/logo/png", "android/web-deploy/icons", "android/app/src/main/res"]) {
  async function collect(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const file = `${path}/${entry.name}`;
      if (entry.isDirectory()) await collect(file);
      else if (entry.name.endsWith(".png")) {
        const data = await readFile(file);
        const width = data.readUInt32BE(16), height = data.readUInt32BE(20);
        if (width !== height) throw new Error(`Icon export must be square: ${file}`);
        exports.set(file, width);
      }
    }
  }
  await collect(directory);
}
exports.set("android/store_icon.png", 512);
exports.set("android/output/store-icon-512.png", 512);
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
try {
  const page = await browser.newPage();
  const rendered = new Map();
  for (const [file, size] of exports) {
    if (!rendered.has(size)) {
      const url = await page.evaluate(async ({ source, size }) => {
        const image = new Image();
        image.src = `data:image/svg+xml;base64,${btoa(source)}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        canvas.getContext("2d").drawImage(image, 0, 0, size, size);
        return canvas.toDataURL("image/png");
      }, { source, size });
      rendered.set(size, Buffer.from(url.split(",")[1], "base64"));
    }
    await writeFile(file, rendered.get(size));
  }
  await writeFile("android/logo/quethink-logo.svg", source);
  console.log(`Rendered ${exports.size} web/Android icons from the new Quethink SVG.`);
} finally {
  await browser.close();
}
