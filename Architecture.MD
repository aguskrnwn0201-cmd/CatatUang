Markdown


# System Architecture - CatatUang

## 1. High-Level Architecture
CatatUang dirancang dengan pendekatan **Client-Side First (Offline-First)**. Seluruh logika bisnis, penyimpanan data, dan render antarmuka berjalan langsung di perangkat pengguna (*browser/device*).

+-------------------------------------------------------------+
|                     User Device (Mobile/PC)                 |
|                                                             |
|  +-------------------------------------------------------+  |
|  |                 Presentation Layer                    |  |
|  |           HTML5 + Tailwind CSS + Chart.js             |  |
|  +---------------------------+---------------------------+  |
|                              |                              |
|  +---------------------------v---------------------------+  |
|  |                  Application Logic                    |  |
|  |        State Management & Event Handlers (JS)         |  |
|  +---------------------------+---------------------------+  |
|                              |                              |
|  +---------------------------v---------------------------+  |
|  |                    Storage Layer                      |  |
|  |         IndexedDB / LocalStorage Wrapper              |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  |                   PWA Layer                           |  |
|  |     Service Worker (Cache) + Web App Manifest         |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+


## 2. Component Breakdown
* **UI Layer:** Menggunakan Tailwind CSS untuk utilitas antarmuka responsif dan Chart.js untuk rekap visualisai pengeluaran.
* **Storage Engine:** Wrapper JavaScript untuk mengelola entitas `wallets`, `categories`, dan `transactions` secara *synchronous/asynchronous* di local storage.
* **Service Worker:** Memastikan seluruh file statis (`.html`, `.css`, `.js`, ikon) di-cache secara lokal agar aplikasi bisa dibuka 100% tanpa jaringan internet.

## 3. Data Flow

### A. Tambah Transaksi
1. User mengisi form input -> Trigger event handler `addTransaction()`.
2. Validasi input (nominal > 0, dompet terpilih).
3. Update saldo akun terkait pada objek `wallets`.
4. Append data transaksi baru ke array `transactions`.
5. Persist data ke `LocalStorage`.
6. Re-render UI (Summary card, Chart, dan Recent Transactions).

### B. Transfer Antar Dompet
1. Validasi saldo dompet asal.
2. Kurangi saldo `wallet_id` pengirim, tambah saldo `wallet_id` penerima.
3. Catat ke transaksi dengan tipe `"transfer"`.
4. Persist data dan re-render UI.

## 4. Packaging Strategy
* **Web/PWA:** Deploy folder statis ke GitHub Pages / Vercel.
* **Android APK:** Menggunakan **Capacitor** untuk membungkus folder build web ke project Android Studio native.