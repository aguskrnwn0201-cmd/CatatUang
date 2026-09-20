# Product Requirement Document (PRD)

## 1. Overview & Goal
* **CatatUang:**
* **Deskripsi:** Aplikasi web responsif (PWA) / APK WebView sederhana untuk mencatat dan mengelola keuangan pribadi secara cepat, gratis, aman, dan tanpa iklan.
* **Tujuan Utama:**
  * Memberikan alternatif pencatatan keuangan tanpa batas *paywall* dan bebas iklan.
  * Proses pencatatan transaksi yang cepat (*quick input*) dengan tampilan minimalis & ramah seluler.
  * Mengutamakan kecepatan akses dan keamanan data pribadi.

---

## 2. Target User & Use Cases
* **Target User:** Pengguna pribadi yang membutuhkan pencatatan kas/dompet harian yang simpel dan transparan.
* **Core Use Cases:**
  1. Pengguna membuka aplikasi dan mencatat pengeluaran/pemasukan dalam waktu kurang dari 10 detik.
  2. Pengguna melihat alokasi pengeluaran bulanan berdasarkan kategori melalui grafik.
  3. Pengguna memindahkan atau mencatat alokasi uang antar dompet (misal: Tunai ke E-Wallet).
  4. Pengguna mengeksport data catatan keuangan ke file CSV/JSON untuk cadangan (*backup*).

---

## 3. Scope & Key Features (MVP)

### 3.1. Dashboard & Visualisasi
* **Header Summary:** Menampilkan Total Saldo, Total Pemasukan Bulan Ini, dan Total Pengeluaran Bulan Ini.
* **Charts:**
  * Pie/Donut Chart untuk komposisi Pengeluaran per Kategori (Bulan Ini).
* **Recent Transactions:** Daftar 5–10 transaksi terakhir dengan tombol "Lihat Semua".

### 3.2. Manajemen Transaksi
* **Input Transaksi (Quick Add):**
  * Tipe: Pemasukan / Pengeluaran / Transfer Antar Dompet.
  * Nominal (Numeric keypad / input angka).
  * Kategori (Pilih dari list atau tambah baru).
  * Pilih Akun/Dompet (misal: Tunai, BCA, GoPay).
  * Tanggal & Waktu (Default: Waktu saat ini).
  * Catatan Singkat (Opsional).
* **Edit & Delete Transaksi:**
  * Kemampuan mengubah atau menghapus riwayat transaksi.

### 3.3. Manajemen Dompet / Akun (Wallet)
* Menambah, mengedit, dan menghapus daftar dompet (misal: Bank A, Bank B, E-Wallet, Cash).
* Menampilkan saldo masing-masing dompet secara real-time.
* Ikon pada tiap daftar dompet

### 3.4. Manajemen Kategori
* Default Kategori Pengeluaran: Makanan, Transportasi, Tagihan, Belanja, Hiburan, Lainnya.
* Default Kategori Pemasukan: Gaji, Bonus, Lembur, Lainnya.
* Fitur Tambah/Hapus Kategori kustom.

### 3.5. Data Management (Backup & Restore)
* **Export Data:** Mengunduh seluruh riwayat transaksi & dompet ke format `.json` atau `.csv`.
* **Import Data:** Memuat kembali file backup `.json` ke dalam aplikasi.
* **Clear Data:** Menghapus seluruh data lokal dengan konfirmasi keamanan.

---

## 4. Technical Architecture & Tech Stack

* **Frontend:** HTML5, Tailwind CSS, JavaScript (React / Vue / Native JS)
* **PWA Capabilities:** 
  * `manifest.json` (Support "Add to Home Screen" & Standalone Viewport)
  * `service-worker.js` (Offline caching assets)
* **Storage Strategy:**
  * **Phase 1 (MVP Local):** IndexedDB / LocalStorage (100% Client-side, Tanpa Server, Gratis).
  * **Phase 2 (Optional Cloud):** REST API / Firebase / Supabase.
* **Build / Wrapper:** Capacitor / TWA jika ingin di-compile menjadi file `.apk` Android.

---

## 5. Non-Functional Requirements (NFR)
* **Performance:** *First Contentful Paint* (FCP) di bawah 1,5 detik pada perangkat mobile.
* **Usability:** Antarmuka responsif (*Mobile-First Design*), dengan ukuran area sentuh (touch target) minimal 48px.
* **Offline-First:** Aplikasi harus tetap berfungsi 100% tanpa koneksi internet.
* **Privacy:** Data keuangan tersimpan secara lokal di perangkat pengguna dan tidak dikirim ke pihak ketiga tanpa izin.

---

## 6. Out of Scope (Untuk Versi Awal)
* Fitur scan nota otomatis (OCR).
* Sinkronisasi otomatis ke rekening bank via API resmi.
* Fitur *multi-user* / berbagi akun keluarga.

---

## 7. Next Steps & Timeline Breakdown
1. **Design / Wireframe:** Menentukan layout bottom navigation & modal form input.
2. **Setup Repository & Tech Stack:** Inisialisasi project & konfig Tailwind CSS + PWA setup.
3. **Core Development:**
   - [ ] Implementasi penyimpanan data lokal (LocalStorage/IndexedDB wrapper).
   - [ ] Form Input Transaksi & Manajemen Dompet.
   - [ ] Dashboard Summary & Chart integration.
4. **Export/Import Feature & Testing:** Pengujian simpan/muat data & offline mode.
5. **PWA / APK Packaging:** Konfigurasi Service Worker atau build APK via Capacitor.