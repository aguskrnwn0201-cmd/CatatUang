# Frontend Specification & Conventions - CatatUang

## 1. Tech Stack
* **Markup:** HTML5
* **Styling:** Tailwind CSS (via CDN atau Build CLI)
* **Logic/State:** Vanilla JavaScript (ES6+) atau React / Vue
* **Icons:** Lucide Icons / Heroicons (SVG)
* **Charting:** Chart.js / ApexCharts

## 2. Project Structure (Vanilla JS Variant)
```text
catat-uang/
├── index.html
├── manifest.json
├── sw.js
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js            # Main entry point & Router
│   │   ├── storage.js        # LocalStorage/IndexedDB CRUD
│   │   ├── ui.js             # DOM manipulation & Renderers
│   │   └── chart.js          # Chart.js initialization
│   └── icons/
│       └── icon-192.png
└── README.md
3. State Management Concept
State disimpan dalam memori sebagai objek tunggal dan disinkronkan ke LocalStorage:

JavaScript


const AppState = {
  wallets: [],
  categories: { income: [], expense: [] },
  transactions: [],
  filter: {
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  }
};
4. Key Functions / Modules
Storage.save(key, data): Mengubah objek JavaScript menjadi JSON dan menyimpan ke storage.

Storage.load(key): Mengambil dan mendeserialisasi data JSON dari storage.

UI.renderSummary(): Mengkalkulasi total saldo, total pemasukan, dan total pengeluaran bulan berjalan.

UI.renderTransactionsList(): Render daftar riwayat transaksi berdasarkan filter aktif.

Chart.updateExpensesChart(): Render ulang grafik donat sesuai kategori transaksi bulan ini.