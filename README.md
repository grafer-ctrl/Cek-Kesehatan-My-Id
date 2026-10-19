# Cek Kesehatan — cekkesehatan.my.id

PWA statis untuk GitHub Pages.

- **Layar 1**: kolom pencarian (hasil muncul langsung saat mengetik) + tombol "Lihat Semua Pemeriksaan".
- **Layar 2** (`#semua`): grid 12 kartu pemeriksaan. Kartu diambil dari `tests.json`.
- Semua navigasi (kembali, pasang aplikasi, tentang) ada di **bagian atas**. Tidak ada bilah navigasi di bawah.
- Tombol Back di HP otomatis kembali dari layar 2 ke layar 1.

## Isi folder

| File | Fungsi |
|---|---|
| `index.html` | Beranda (layar pencarian + grid) |
| `tests.json` | Daftar kartu pemeriksaan |
| `asam-urat.html` | Halaman isian Cek Asam Urat |
| `manifest.webmanifest` | Pengaturan PWA (nama, warna, ikon) |
| `sw.js` | Service worker (offline + cache) |
| `icons/`, `favicon.svg` | Ikon aplikasi |
| `CNAME` | Domain kustom `www.cekkesehatan.my.id` |
| `.nojekyll` | Mematikan Jekyll di GitHub Pages |

## Deploy ke GitHub Pages

1. Buat repo, lalu unggah **semua isi folder ini ke root repo**.
2. Repo → **Settings → Pages** → *Deploy from a branch* → `main` / `(root)`.
3. Isi **Custom domain** `www.cekkesehatan.my.id`, centang **Enforce HTTPS** (wajib untuk PWA).
4. Di DNS domain buat record **CNAME**: host `www` → `USERNAME.github.io`.

## Menambah / mengaktifkan pemeriksaan

Setiap kartu di `tests.json` punya kolom `halaman` (nama file HTML). Cukup unggah file dengan nama itu, lalu kartu otomatis aktif. Kartu yang file-nya belum ada otomatis bertanda **Segera hadir** (tap → muncul pemberitahuan di atas layar).

```json
{
  "id": "kolesterol",
  "judul": "Cek Kolesterol",
  "deskripsi": "Perkirakan risiko kolesterol tinggi dari pola makan.",
  "kategori": "Metabolik",
  "ikon": "activity",
  "halaman": "kolesterol.html",
  "menit": 3,
  "kata": ["lemak", "lipid", "ldl"]
}
```

- `kata` = kata kunci tambahan untuk pencarian (mis. orang mengetik "maag" akan menemukan Cek Perut).
- `"aktif": false` memaksa kartu tetap "Segera hadir".
- Urutan kartu mengikuti urutan di `tests.json`.
- Ikon: `flame`, `droplet`, `activity`, `gauge`, `heart`, `bean`, `smile`, `moon`, `eye`, `scale`, `shield`, `brain`, `ribbon`, `wind`, `bone`, `spine`, `stomach`, `more`.

## Tips untuk halaman pemeriksaan

Tambahkan di `<head>` (sudah ada di `asam-urat.html`):

```html
<meta name="theme-color" content="#0A6CB8">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
```

Tulis `font: 600 15px var(--font)` atau `font-family: inherit` secara terpisah. `font: 600 15px inherit` tidak valid dan diabaikan browser.

## Cache & pembaruan

- Beranda dan halaman pemeriksaan diambil dari jaringan lebih dulu, jadi selalu terbaru saat online.
- Setelah mengubah `index.html`, ikon, atau `manifest.webmanifest`, naikkan `VERSION` di `sw.js` (sekarang `v2`) agar cache lama terhapus.
