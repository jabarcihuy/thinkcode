# Quethink Android (TWA)

APK/AAB wrapper untuk web Quethink menggunakan **Trusted Web Activity (Bubblewrap)**.
Konten aplikasi di-load live dari `https://www.barlabs.my.id` — **push web = app terupdate otomatis**, tanpa rebuild APK.

```
APK (cangkang) ──load──> https://www.barlabs.my.id (web Next.js)
```

## Hasil build

| File | Fungsi |
|---|---|
| `output/quethink-1.0.0.apk` | Install langsung ke HP (sideload) |
| `output/quethink-1.0.0.aab` | Upload ke Google Play Store |
| `output/store-icon-512.png` | Icon Play Store 512×512 |

- Package ID: `com.jabarcihuy.quethink`
- Keystore: `keystore/quethink.keystore` (alias `quethink`)
- SHA-256 fingerprint: `77:4C:FD:23:4C:4F:35:05:B6:59:89:CD:C0:7B:30:86:51:DD:D4:4C:E5:27:9A:E1:4C:A5:2F:67:FE:81:56:88`

## ⚠️ WAJIB: Deploy 3 file ke web (sekali saja)

Agar address bar Chrome hilang (mode TWA penuh, bukan Custom Tab), file di `web-deploy/` harus tersedia di web:

| File di `android/web-deploy/` | Deploy ke URL |
|---|---|
| `manifest.json` | `https://www.barlabs.my.id/manifest.json` |
| `.well-known/assetlinks.json` | `https://www.barlabs.my.id/.well-known/assetlinks.json` |
| `icons/icon-192.png` | `https://www.barlabs.my.id/icons/icon-192.png` |
| `icons/icon-512.png` | `https://www.barlabs.my.id/icons/icon-512.png` |
| `icons/icon-maskable-512.png` | `https://www.barlabs.my.id/icons/icon-maskable-512.png` |

Di project Next.js: copy ke `public/` (mis. `public/manifest.json`, `public/.well-known/assetlinks.json`, `public/icons/...`) lalu deploy. Ini satu-satunya perubahan yang diperlukan di project web — setelah itu **tidak perlu disentuh lagi**.

Verifikasi setelah deploy:
```bash
curl -s https://www.barlabs.my.id/.well-known/assetlinks.json
curl -s https://www.barlabs.my.id/manifest.json
```

## Alur update sehari-hari

```
edit kode web → git commit → git push → Vercel deploy
→ user buka app → otomatis versi terbaru ✅
```

APK di HP user **tidak perlu** diupdate untuk konten baru. Rebuild APK hanya jika:
- Ganti icon / nama app
- Ganti domain
- Naik versi untuk Play Store (`versionCode` harus naik)

## Rebuild APK

```bash
cd android
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export ANDROID_HOME=$HOME/Android/Sdk

# 1. Build
./gradlew assembleRelease bundleRelease --no-daemon

# 2. Sign APK
PASS=$(grep KEYSTORE_PASSWORD keystore/credentials.txt | cut -d= -f2)
ALIAS=$(grep KEY_ALIAS keystore/credentials.txt | cut -d= -f2)
$ANDROID_HOME/build-tools/36.1.0/zipalign -p 4 \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  app-release-unsigned-aligned.apk
$ANDROID_HOME/build-tools/36.1.0/apksigner sign \
  --ks keystore/quethink.keystore --ks-key-alias "$ALIAS" \
  --ks-pass "pass:$PASS" --key-pass "pass:$PASS" \
  --out app-release-signed.apk app-release-unsigned-aligned.apk

# 3. Sign AAB
cp app/build/outputs/bundle/release/app-release.aab app-release-bundle.aab
jarsigner -keystore keystore/quethink.keystore -storepass "$PASS" -keypass "$PASS" \
  app-release-bundle.aab "$ALIAS"

# 4. Verifikasi
$ANDROID_HOME/build-tools/36.1.0/apksigner verify --print-certs app-release-signed.apk
jarsigner -verify app-release-bundle.aab
```

Ganti versi: edit `twa-manifest.json` → `appVersionCode` +1 dan `appVersionName`, lalu sinkronkan `app/build.gradle` (versionCode/versionName) sebelum build.

## Test di HP

```bash
adb install -r output/quethink-1.0.0.apk
```

Cek apakah TWA penuh (bukan Custom Tab):
```bash
adb logcat -v brief | grep TWAProviderPicker
```
Jika muncul `Found TWA provider: com.google.android.apps.chrome` dan tidak ada address bar → verifikasi assetlinks sukses.

## Struktur

```
android/
├── twa-manifest.json          # Konfigurasi TWA (sumber kebenaran)
├── app/                       # Project Android (generated)
├── keystore/                  # Keystore + credentials (JANGAN commit credentials)
├── logo/                      # Logo SVG + PNG source
├── web-deploy/                # File yang harus di-deploy ke web
│   ├── manifest.json
│   ├── icons/
│   └── .well-known/assetlinks.json
└── output/                    # APK/AAB final
```

## Catatan Play Store

Saat upload ke Play Store, Play akan membuat **signing key tambahan**. Tambahkan fingerprint Play Console ke `assetlinks.json`:

```bash
cd android
bubblewrap fingerprint add "SHA256_DARI_PLAY_CONSOLE" --name=play-signing --manifest=twa-manifest.json
bubblewrap fingerprint generateAssetLinks --manifest=twa-manifest.json --output=web-deploy/.well-known/assetlinks.json
```
Lalu deploy ulang `assetlinks.json` ke web. Fingerprint ada di Play Console → App → Release → Setup → App signing.

## Catatan penting

- **Keystore = identitas permanen app.** Simpan `keystore/quethink.keystore` + password di tempat aman (password manager / backup offline). Jika hilang, tidak bisa update app di Play Store lagi.
- Login Supabase & semua fitur web (SQLite WASM, PDF, AI tutor) jalan normal di TWA karena semuanya berjalan di Chrome yang sama.
- `barlabs.my.id` (non-www) redirect 308 ke `www.barlabs.my.id` — APK diarahkan langsung ke `www` untuk menghindari masalah redirect di TWA.


## Mobile shell update — 7 Oktober 2026

Source manifest dan Gradle kini memakai launch URL `/app`, yang memeriksa sesi server lalu menuju Dashboard, mode tamu, atau Login. APK lama tetap memakai URL sebelumnya sampai di-rebuild dan ditandatangani kembali. Binary APK/AAB tidak dibangun ulang pada perubahan web ini.

Web production mendaftarkan service worker untuk layar publik saat koneksi terputus saja. Materi, API, hasil tes, token dan progress tidak di-cache. Uji keyboard Android, tombol Back, cutout, TalkBack dan unduhan PDF pada perangkat fisik sebelum merilis ulang APK.

## Logo baru

Logo silinder lama telah diganti dengan simbol Q berbentuk tabel. Sumber utama: `../public/assets/quethink/quethink-mark.svg` dan versi ikon `../public/assets/quethink/app-icon.svg`. Dari root project, `node scripts/render-quethink-icons.mjs` memperbarui ekspor PNG web, launcher, maskable, splash, dan store icon. Perubahan ikon web berlaku setelah deployment; ikon launcher/splash yang sudah tertanam dalam APK/AAB memerlukan rebuild dan pemasangan versi baru.
