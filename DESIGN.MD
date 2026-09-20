# Design System & UI/UX Guidelines - CatatUang

## 1. Design Philosophy
* **Mobile-First & One-Handed Use:** Elemen navigasi utama dan tombol aksi cepat diletakkan di area bawah (*thumb zone*).
* **Minimalist & Clean:** Mengurangi kerumitan visual agar pengguna bisa mencatat transaksi dalam < 10 detik.
* **Clear Visual Feedback:** Penggunaan warna yang kontras untuk membedakan Pemasukan (Hijau) dan Pengeluaran (Merah).

## 2. Color Palette
* **Primary (Brand):** Emerald (`#10B981`)
* **Income (Green):** Green 600 (`#16A34A`)
* **Expense (Red):** Rose 600 (`#E11D48`)
* **Neutral Background:** Slate 50 (`#F8FAFC`)
* **Surface/Cards:** White (`#FFFFFF`)
* **Text Primary:** Slate 900 (`#0F172A`)
* **Text Secondary:** Slate 500 (`#64748B`)

## 3. Typography
* **Font Family:** Inter / System UI Font (`system-ui, sans-serif`)
* **Hierarchy:**
  * Header/Summary Amount: 28px - 32px (Bold)
  * Card Titles: 16px - 18px (SemiBold)
  * Body/List Items: 14px (Regular)
  * Subtext/Date: 12px (Regular)

## 4. UI Components Specification
* **Bottom Navigation Bar:**
  * Fixed di bagian bawah layar.
  * 4 Menu Utama: Dashboard, Transaksi, Dompet, Pengaturan.
  * Floating Action Button (FAB) `+` di tengah navigasi untuk pencatatan cepat.
* **Input Modal (Quick Add):**
  * Tipe transaksi (Pemasukan, Pengeluaran, Transfer) menggunakan Segmented Control.
  * Input nominal besar dengan simbol mata uang (`Rp`).
* **Wallet Cards:**
  * Menampilkan Ikon SVG / Lucide Icon, Nama Dompet, dan Saldo Terakhir.

## 5. Micro-interactions
* Modal muncul dari bawah (*slide-up animation*).
* Feedback visual (Ripple / Opacity change) saat tombol ditekan (Touch Target min 48px).