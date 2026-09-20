# Project Roadmap - CatatUang

> Roadmap ini disusun berdasarkan PRD, Architecture, Design, dan Frontend spec yang sudah ada.
> Setiap fase memiliki deliverable yang jelas dan dapat diverifikasi secara mandiri.

---

## Status Legenda
- `[ ]` Belum dikerjakan
- `[~]` Sedang dikerjakan
- `[x]` Selesai

---

## Phase 0: Foundation & Setup
**Target: Hari 1**

### 0.1 Struktur Proyek
- [x] Dokumen arsitektur selesai (PRD, Architecture, Design, Frontend, Skill, Roadmap)
- [x] Inisialisasi folder & file kosong sesuai struktur di `FRONTEND.MD`
- [x] Setup Tailwind CSS (via CDN untuk simplisitas awal)
- [x] Setup Lucide Icons (via CDN)
- [x] Setup Chart.js (via CDN)

### 0.2 Kerangka HTML
- [x] `index.html` dengan struktur dasar: `<head>`, bottom nav placeholder, dan area konten
- [x] Link semua CDN dependencies (Tailwind, Lucide, Chart.js)
- [ ] Verifikasi tampil di browser (mobile viewport 390px)

---

## Phase 1: Storage Layer
**Target: Hari 1–2**

> Fondasi data harus solid sebelum UI dibangun. Semua fitur bergantung pada layer ini.

### 1.1 Modul `storage.js`
- [x] Implementasi `Storage.save(key, data)` — serialize JSON ke LocalStorage
- [x] Implementasi `Storage.load(key)` — deserialize JSON dari LocalStorage
- [x] Implementasi `Storage.remove(key)` — hapus satu entri
- [x] Implementasi `Storage.clear()` — hapus semua data aplikasi

### 1.2 Data Seeding (Default Data)
- [x] Default kategori pengeluaran: `Makanan`, `Transportasi`, `Tagihan`, `Belanja`, `Hiburan`, `Lainnya`
- [x] Default kategori pemasukan: `Gaji`, `Bonus`, `Lembur`, `Lainnya`
- [x] Fungsi `initDefaultData()` — populate storage jika data belum ada (first launch)

### 1.3 State Management (`app.js`)
- [x] Definisi objek `AppState` (wallets, categories, transactions, filter)
- [x] Fungsi `loadState()` — baca semua data dari storage ke AppState
- [x] Fungsi `saveState()` — tulis AppState ke storage

---

## Phase 2: UI Shell & Navigasi
**Target: Hari 2–3**

### 2.1 Bottom Navigation Bar
- [x] 4 tab: Dashboard, Transaksi, Dompet, Pengaturan
- [x] Floating Action Button (FAB) `+` di tengah
- [x] Active state styling (tab yang aktif highlight dengan warna Emerald)
- [x] Logika switching view (sembunyikan/tampilkan section berdasarkan tab aktif)

### 2.2 Layout Dasar Tiap Halaman
- [x] **Dashboard:** Header summary card + area chart + area recent transactions
- [x] **Transaksi:** Header filter bulan + daftar transaksi kosong (placeholder)
- [x] **Dompet:** Header total saldo + grid daftar dompet kosong (placeholder)
- [x] **Pengaturan:** Daftar menu pengaturan (placeholder)

---

## Phase 3: Fitur Dompet (Wallet)
**Target: Hari 3–4**

### 3.1 Tampilan Daftar Dompet
- [x] Render daftar dompet dari `AppState.wallets`
- [x] Tiap kartu dompet menampilkan: ikon, nama, dan saldo (format Rupiah)
- [x] Tampilkan total saldo semua dompet di header halaman

### 3.2 Tambah / Edit Dompet
- [x] Modal form: nama dompet, saldo awal, pilih ikon (dari set ikon yang tersedia)
- [x] Validasi: nama tidak boleh kosong, saldo awal ≥ 0
- [x] Simpan ke storage & update AppState
- [x] Mode edit: isi form dengan data dompet yang dipilih

### 3.3 Hapus Dompet
- [x] Konfirmasi dialog sebelum hapus
- [x] Cek: dompet tidak bisa dihapus jika masih memiliki transaksi terkait
- [x] Hapus dari storage & update UI

---

## Phase 4: Fitur Transaksi
**Target: Hari 4–6**

### 4.1 Modal Input Transaksi (Quick Add)
- [x] Segmented control: **Pengeluaran** | **Pemasukan** | **Transfer**
- [x] Input nominal besar dengan prefix `Rp`
- [x] Dropdown pilih kategori (filter sesuai tipe transaksi)
- [x] Dropdown pilih dompet (asal & tujuan untuk Transfer)
- [x] Date/time picker (default: waktu sekarang)
- [x] Input catatan opsional
- [x] Tombol Simpan & Batal
- [x] Validasi: nominal > 0, kategori & dompet wajib dipilih

### 4.2 Logika Penyimpanan Transaksi
- [x] Generate `id` unik untuk tiap transaksi (timestamp atau UUID sederhana)
- [x] Update saldo dompet setelah transaksi disimpan
- [x] Khusus Transfer: kurangi saldo dompet asal, tambah saldo dompet tujuan
- [x] Validasi saldo: Transfer tidak boleh melebihi saldo dompet asal

### 4.3 Tampilan Daftar Transaksi
- [x] Render semua transaksi dari `AppState.transactions`
- [x] Filter berdasarkan bulan & tahun (navigasi `< Bulan >`)
- [x] Tampilkan: ikon kategori, nama kategori, nama dompet, tanggal, nominal (merah/hijau)
- [x] Pengelompokan per hari (misal header "Jumat, 19 Sep 2026")

### 4.4 Edit & Hapus Transaksi
- [x] Tap transaksi → tampilkan modal detail dengan opsi Edit / Hapus
- [x] Edit: revert saldo lama, terapkan saldo baru
- [x] Hapus: revert perubahan saldo, hapus dari storage

---

## Phase 5: Dashboard & Visualisasi
**Target: Hari 6–7**

### 5.1 Summary Cards (Header)
- [x] **Total Saldo:** jumlah saldo semua dompet
- [x] **Pemasukan Bulan Ini:** total transaksi pemasukan bulan berjalan
- [x] **Pengeluaran Bulan Ini:** total transaksi pengeluaran bulan berjalan
- [x] Semua angka diformat ke Rupiah (`Intl.NumberFormat('id-ID')`)

### 5.2 Donut Chart (Chart.js)
- [x] Render pengeluaran per kategori untuk bulan berjalan
- [x] Tampilkan legenda kategori dengan warna unik masing-masing
- [x] Update otomatis saat data berubah (`Chart.updateExpensesChart()`)
- [x] Tampilkan pesan "Belum ada pengeluaran bulan ini" jika data kosong

### 5.3 Recent Transactions
- [x] Tampilkan 5 transaksi terakhir
- [x] Tombol "Lihat Semua" → pindah ke tab Transaksi

---

## Phase 6: Manajemen Kategori
**Target: Hari 7–8**

### 6.1 Tampilan Daftar Kategori
- [x] Tampilkan di halaman Pengaturan, dipisah antara Pengeluaran & Pemasukan
- [x] Tampilkan kategori default (tidak bisa dihapus, ditandai badge "Default")

### 6.2 Tambah / Hapus Kategori Kustom
- [x] Form tambah: nama kategori, tipe (pengeluaran/pemasukan)
- [x] Validasi: nama tidak boleh duplikat
- [x] Hapus: hanya kategori kustom yang bisa dihapus
- [x] Saat kategori dihapus, transaksi terkait tetap ada (kategori berubah jadi "Lainnya")

---

## Phase 7: Data Management (Backup & Restore)
**Target: Hari 8–9**

### 7.1 Export Data
- [x] Export ke `.json` — seluruh AppState (wallets, categories, transactions)
- [x] Export ke `.csv` — daftar transaksi saja (kompatibel dengan Excel)
- [x] Nama file otomatis: `catatuang-backup-YYYY-MM-DD.json`

### 7.2 Import Data
- [x] Input `<file>` untuk memilih file `.json`
- [x] Validasi format file sebelum diproses
- [x] Konfirmasi dialog: "Import akan menimpa data saat ini. Lanjutkan?"
- [x] Load data dari file ke AppState & storage

### 7.3 Clear All Data
- [x] Tombol "Hapus Semua Data" di halaman Pengaturan
- [x] Konfirmasi 2 langkah (dialog pertama + konfirmasi kedua)
- [x] Reset ke kondisi awal (hanya default data tersisa)

---

## Phase 8: PWA & Offline Support
**Target: Hari 9–10**

### 8.1 Web App Manifest (`manifest.json`)
- [x] Konfigurasi `name`, `short_name`, `start_url`, `display: standalone`
- [x] Set warna tema: `theme_color: #10B981`
- [x] Ikon PWA: ukuran 192x192 dan 512x512

### 8.2 Service Worker (`sw.js`)
- [x] Strategi **Cache-First** untuk semua asset statis (HTML, CSS, JS, ikon)
- [x] Event `install` → pre-cache semua file
- [x] Event `activate` → hapus cache lama
- [x] Event `fetch` → serve dari cache, fallback ke network

### 8.3 Verifikasi PWA
- [x] Audit dengan Lighthouse (target skor PWA ≥ 90)
- [x] Test "Add to Home Screen" di Android Chrome
- [x] Test mode offline: semua fitur berjalan tanpa koneksi internet

---

## Phase 9: Polish, Testing & Release
**Target: Hari 10–14**

### 9.1 UI Polish
- [x] Animasi slide-up untuk semua modal
- [x] Toast notification untuk semua aksi (simpan, hapus, export, import)
- [x] Empty state yang informatif di tiap halaman
- [x] Safe area bottom nav untuk iPhone notch

### 9.2 Functional Testing (Manual)
- [x] Alur lengkap: tambah dompet → catat transaksi → cek dashboard
- [x] Transfer antar dompet: verifikasi saldo kedua dompet berubah dengan benar
- [x] Validasi saldo transfer: tidak bisa melebihi saldo dompet asal
- [x] Edit transaksi: verifikasi saldo di-revert & dihitung ulang dengan benar
- [x] Export → Clear Data → Import: verifikasi data kembali sempurna
- [x] Offline mode: matikan jaringan, pastikan semua fitur tetap berjalan

### 9.3 Deployment
- [x] Deploy ke **Vercel** atau **GitHub Pages** (folder statis, tanpa build step)
- [x] Verifikasi URL publik bisa diakses & PWA install prompt muncul

### 9.4 Android APK (Opsional)
- [ ] Setup Capacitor (`npm init` + install `@capacitor/core`, `@capacitor/android`)
- [ ] `npx cap init` & `npx cap add android`
- [ ] Build & test APK di Android Studio
- [ ] Testing install APK di perangkat fisik

---

## Summary Timeline

| Phase | Fokus | Estimasi |
|-------|-------|----------|
| 0 | Foundation & Setup | Hari 1 |
| 1 | Storage Layer | Hari 1–2 |
| 2 | UI Shell & Navigasi | Hari 2–3 |
| 3 | Fitur Dompet | Hari 3–4 |
| 4 | Fitur Transaksi | Hari 4–6 |
| 5 | Dashboard & Chart | Hari 6–7 |
| 6 | Manajemen Kategori | Hari 7–8 |
| 7 | Backup & Restore | Hari 8–9 |
| 8 | PWA & Offline | Hari 9–10 |
| 9 | Polish & Release | Hari 10–14 |

> **Total estimasi: ~2 minggu** untuk MVP yang fully functional dan siap deploy.
