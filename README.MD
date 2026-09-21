# 💰 CatatUang - Simple Finance Tracker

Aplikasi pencatat dan pengelola keuangan pribadi yang ringan, cepat, gratis, aman, dan tanpa iklan. Didesain dengan pendekatan *Mobile-First* dan *Offline-First* agar pengguna dapat mencatat transaksi harian dalam hitungan detik.

---

## ✨ Fitur Utama (MVP)

* **⚡ Quick Transaction Input:** Catat pemasukan, pengeluaran, dan transfer antar dompet dalam waktu < 10 detik.
* **👛 Multi-Wallet / Dompet:** Kelola saldo di berbagai akun (Cash, Bank, E-Wallet) lengkap dengan ikon pendukung.
* **📊 Visualisasi & Ringkasan:** Ringkasan total saldo, pemasukan, dan pengeluaran bulanan serta grafik pengeluaran per kategori (*Chart.js*).
* **📱 PWA & Offline Support:** Bisa di-install ke layar utama (*Add to Home Screen*) dan dapat digunakan 100% tanpa jaringan internet.
* **🛡️ Privasi 100%:** Data keuangan tersimpan secara lokal di perangkat pengguna (tanpa server pihak ketiga).
* **💾 Backup & Restore:** Fitur Export/Import data ke format JSON dan CSV kapan saja.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (ES6+)
* **Charting:** Chart.js
* **Icons:** Lucide Icons / Heroicons
* **PWA Engine:** Service Worker & Web App Manifest
* **Mobile Packaging:** Capacitor / TWA (Trusted Web Activity)

---

## 📁 Dokumentasi Proyek

Dokumen rinci mengenai arsitektur, desain, dan pengembangan dapat ditemukan di folder root proyek:

| File | Deskripsi |
| :--- | :--- |
| [`PRD.MD`](./PRD.MD) | Product Requirement Document & ruang lingkup fitur |
| [`ARCHITECTURE.MD`](./ARCHITECTURE.MD) | Arsitektur sistem, aliran data, dan strategi penyimpanan |
| [`DESIGN.MD`](./DESIGN.MD) | Panduan sistem desain UI/UX, warna, dan tipografi |
| [`FRONTEND.MD`](./FRONTEND.MD) | Spesifikasi teknis frontend & konvensi kode |
| [`SKILL.MD`](./SKILL.MD) | Kebutuhan skill & pengetahuan pengembangan proyek |
| [`ROADMAP.MD`](./ROADMAP.MD) | Tahapan eksekusi dan lini masa pengembangan |

---

## 🚀 Cara Menjalankan Proyek (Lokal)

Karena proyek ini menggunakan pendekatan *Client-Side First*, kamu bisa menjalankannya tanpa perlu setup server yang rumit:

1. **Clone repository ini:**
   ```bash
   git clone [https://github.com/username/catatuang.git](https://github.com/username/catatuang.git)
   cd catatuang
Jalankan via Live Server:

Jika menggunakan VS Code, buka folder proyek dan gunakan ekstensi Live Server (Right click index.html -> Open with Live Server).

Atau gunakan perintah CLI sederhana (misal menggunakan Node.js):

Bash


npx serve .
Buka browser dan akses http://localhost:3000 (atau port yang tertera).

📱 Packaging ke APK (Android)
Untuk mengubah web ini menjadi file .apk Android menggunakan Capacitor:

Inisialisasi Capacitor di folder proyek:

Bash


npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init CatatUang com.catatuang.app
Tambahkan platform Android:

Bash


npx cap add android
Buka project di Android Studio untuk melakukan build file .apk:

Bash


npx cap open android
📄 Lisensi
Proyek ini dibuat untuk penggunaan pribadi secara bebas dan bersifat open-source di bawah lisensi MIT License.


---

