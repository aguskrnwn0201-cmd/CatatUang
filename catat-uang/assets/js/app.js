/**
 * app.js — Entry point & State Management CatatUang
 * Urutan load: storage.js → app.js → ui.js → chart.js
 */

// ============================================================
// 1. DEFAULT DATA
// ============================================================

const DEFAULT_CATEGORIES = {
  expense: [
    { id: 'cat_makanan',       name: 'Makanan',       icon: 'utensils',       isDefault: true },
    { id: 'cat_transportasi',  name: 'Transportasi',  icon: 'car',            isDefault: true },
    { id: 'cat_tagihan',       name: 'Tagihan',       icon: 'zap',            isDefault: true },
    { id: 'cat_belanja',       name: 'Belanja',       icon: 'shopping-bag',   isDefault: true },
    { id: 'cat_hiburan',       name: 'Hiburan',       icon: 'gamepad-2',      isDefault: true },
    { id: 'cat_lainnya_exp',   name: 'Lainnya',       icon: 'more-horizontal',isDefault: true },
  ],
  income: [
    { id: 'cat_gaji',          name: 'Gaji',          icon: 'briefcase',      isDefault: true },
    { id: 'cat_bonus',         name: 'Bonus',         icon: 'gift',           isDefault: true },
    { id: 'cat_lembur',        name: 'Lembur',        icon: 'clock',          isDefault: true },
    { id: 'cat_lainnya_inc',   name: 'Lainnya',       icon: 'more-horizontal',isDefault: true },
  ],
};

const DEFAULT_SETTINGS = {
  currency:   'IDR',
  locale:     'id-ID',
  installedAt: new Date().toISOString(),
};

// ============================================================
// 2. APP STATE
// ============================================================

/**
 * AppState — satu-satunya sumber kebenaran data di memori.
 * Selalu disinkronkan ke/dari LocalStorage lewat loadState() / saveState().
 */
const AppState = {
  wallets:      [],   // { id, name, icon, balance, createdAt }
  categories:   { income: [], expense: [] },
  transactions: [],   // { id, type, amount, categoryId, walletId, walletToId?, date, note }
  settings:     {},
  filter: {
    month: new Date().getMonth(),   // 0-indexed (0 = Januari)
    year:  new Date().getFullYear(),
  },
};

// ============================================================
// 3. STATE MANAGEMENT
// ============================================================

/**
 * Muat semua data dari LocalStorage ke AppState.
 * Dipanggil sekali saat app pertama kali dibuka.
 */
function loadState() {
  AppState.wallets      = Storage.load(STORAGE_KEYS.WALLETS,      []);
  AppState.categories   = Storage.load(STORAGE_KEYS.CATEGORIES,   { income: [], expense: [] });
  AppState.transactions = Storage.load(STORAGE_KEYS.TRANSACTIONS,  []);
  AppState.settings     = Storage.load(STORAGE_KEYS.SETTINGS,      {});
}

/**
 * Tulis semua AppState ke LocalStorage.
 * Dipanggil setiap kali ada perubahan data.
 */
function saveState() {
  Storage.save(STORAGE_KEYS.WALLETS,      AppState.wallets);
  Storage.save(STORAGE_KEYS.CATEGORIES,   AppState.categories);
  Storage.save(STORAGE_KEYS.TRANSACTIONS, AppState.transactions);
  Storage.save(STORAGE_KEYS.SETTINGS,     AppState.settings);
}

/**
 * Populate data default jika aplikasi baru pertama kali dijalankan.
 * Hanya dijalankan saat Storage.isFirstLaunch() === true.
 */
function initDefaultData() {
  AppState.categories = {
    income:  [...DEFAULT_CATEGORIES.income],
    expense: [...DEFAULT_CATEGORIES.expense],
  };
  AppState.wallets      = [];
  AppState.transactions = [];
  AppState.settings     = { ...DEFAULT_SETTINGS };
  saveState();
  console.info('[App] Data default berhasil diinisialisasi.');
}

// ============================================================
// 4. HELPER UTILITIES
// ============================================================

/**
 * Generate ID unik sederhana berbasis timestamp + random.
 * @returns {string} contoh: "1726761234567_a3f"
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

/**
 * Format angka ke string Rupiah.
 * @param {number} amount
 * @returns {string} contoh: "Rp 1.500.000"
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style:    'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format objek Date ke string tanggal lokal Indonesia.
 * @param {string|Date} dateInput
 * @returns {string} contoh: "Jumat, 19 September 2026"
 */
function formatDateLong(dateInput) {
  return new Date(dateInput).toLocaleDateString('id-ID', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

/**
 * Format objek Date ke string pendek.
 * @param {string|Date} dateInput
 * @returns {string} contoh: "19 Sep 2026"
 */
function formatDateShort(dateInput) {
  return new Date(dateInput).toLocaleDateString('id-ID', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

/**
 * Nama bulan dalam Bahasa Indonesia.
 * @param {number} month - 0-indexed
 * @param {number} year
 * @returns {string} contoh: "September 2026"
 */
function formatMonthYear(month, year) {
  return new Date(year, month, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year:  'numeric',
  });
}

/**
 * Cari kategori berdasarkan ID dari AppState.
 * @param {string} categoryId
 * @returns {object|null}
 */
function getCategoryById(categoryId) {
  const all = [...AppState.categories.income, ...AppState.categories.expense];
  return all.find(c => c.id === categoryId) || null;
}

/**
 * Cari dompet berdasarkan ID dari AppState.
 * @param {string} walletId
 * @returns {object|null}
 */
function getWalletById(walletId) {
  return AppState.wallets.find(w => w.id === walletId) || null;
}

// ============================================================
// 5. WALLET CRUD
// ============================================================

/**
 * Tambah dompet baru ke AppState dan simpan ke storage.
 * @param {object} data - { name, icon, balance }
 * @returns {object} wallet yang baru dibuat
 */
function addWallet({ name, icon = 'wallet', balance = 0 }) {
  const wallet = {
    id:        generateId(),
    name:      name.trim(),
    icon,
    balance:   Number(balance) || 0,
    createdAt: new Date().toISOString(),
  };
  AppState.wallets.push(wallet);
  saveState();
  return wallet;
}

/**
 * Edit nama dan ikon dompet yang sudah ada.
 * Saldo tidak boleh diubah langsung di sini — harus lewat transaksi.
 * @param {string} walletId
 * @param {object} data - { name, icon }
 * @returns {boolean} true jika berhasil
 */
function editWallet(walletId, { name, icon }) {
  const wallet = AppState.wallets.find(w => w.id === walletId);
  if (!wallet) return false;
  wallet.name = name.trim();
  wallet.icon = icon;
  saveState();
  return true;
}

/**
 * Hapus dompet dari AppState.
 * Catatan: validasi "ada transaksi terkait" dilakukan di UI sebelum memanggil ini.
 * @param {string} walletId
 * @returns {boolean} true jika berhasil
 */
function deleteWallet(walletId) {
  const idx = AppState.wallets.findIndex(w => w.id === walletId);
  if (idx === -1) return false;
  AppState.wallets.splice(idx, 1);
  saveState();
  return true;
}

/**
 * Cek apakah dompet masih memiliki transaksi terkait.
 * @param {string} walletId
 * @returns {boolean}
 */
function walletHasTransactions(walletId) {
  return AppState.transactions.some(
    tx => tx.walletId === walletId || tx.walletToId === walletId
  );
}

// ============================================================
// 6. TRANSACTION CRUD
// ============================================================

/**
 * Tambah transaksi baru, update saldo dompet, simpan ke storage.
 * @param {object} data - { type, amount, categoryId, walletId, walletToId?, date, note }
 * @returns {object} transaksi yang baru dibuat
 */
function addTransaction({ type, amount, categoryId, walletId, walletToId, date, note }) {
  const tx = {
    id:         generateId(),
    type,                          // 'income' | 'expense' | 'transfer'
    amount:     Number(amount),
    categoryId: categoryId || null,
    walletId,
    walletToId: walletToId || null,
    date:       date || new Date().toISOString(),
    note:       (note || '').trim(),
    createdAt:  new Date().toISOString(),
  };

  // Update saldo dompet
  const wallet = AppState.wallets.find(w => w.id === walletId);
  if (wallet) {
    if (type === 'income')   wallet.balance += tx.amount;
    if (type === 'expense')  wallet.balance -= tx.amount;
    if (type === 'transfer') wallet.balance -= tx.amount;
  }
  if (type === 'transfer' && walletToId) {
    const walletTo = AppState.wallets.find(w => w.id === walletToId);
    if (walletTo) walletTo.balance += tx.amount;
  }

  AppState.transactions.push(tx);
  saveState();
  return tx;
}

/**
 * Edit transaksi — revert efek saldo lama, terapkan saldo baru.
 * @param {string} txId
 * @param {object} data - field yang diubah
 * @returns {boolean}
 */
function editTransaction(txId, data) {
  const idx = AppState.transactions.findIndex(t => t.id === txId);
  if (idx === -1) return false;

  const old = AppState.transactions[idx];

  // 1. Revert saldo dari transaksi lama
  _revertTransactionBalance(old);

  // 2. Terapkan data baru
  const updated = {
    ...old,
    type:       data.type       ?? old.type,
    amount:     Number(data.amount ?? old.amount),
    categoryId: data.categoryId ?? old.categoryId,
    walletId:   data.walletId   ?? old.walletId,
    walletToId: data.walletToId ?? old.walletToId,
    date:       data.date       ?? old.date,
    note:       (data.note !== undefined ? data.note : old.note).trim(),
  };
  AppState.transactions[idx] = updated;

  // 3. Terapkan saldo baru
  _applyTransactionBalance(updated);

  saveState();
  return true;
}

/**
 * Hapus transaksi — revert efek saldo, hapus dari array.
 * @param {string} txId
 * @returns {boolean}
 */
function deleteTransaction(txId) {
  const idx = AppState.transactions.findIndex(t => t.id === txId);
  if (idx === -1) return false;

  _revertTransactionBalance(AppState.transactions[idx]);
  AppState.transactions.splice(idx, 1);
  saveState();
  return true;
}

/** Internal — batalkan efek saldo dari sebuah transaksi */
function _revertTransactionBalance(tx) {
  const wallet = AppState.wallets.find(w => w.id === tx.walletId);
  if (wallet) {
    if (tx.type === 'income')   wallet.balance -= tx.amount;
    if (tx.type === 'expense')  wallet.balance += tx.amount;
    if (tx.type === 'transfer') wallet.balance += tx.amount;
  }
  if (tx.type === 'transfer' && tx.walletToId) {
    const walletTo = AppState.wallets.find(w => w.id === tx.walletToId);
    if (walletTo) walletTo.balance -= tx.amount;
  }
}

/** Internal — terapkan efek saldo dari sebuah transaksi */
function _applyTransactionBalance(tx) {
  const wallet = AppState.wallets.find(w => w.id === tx.walletId);
  if (wallet) {
    if (tx.type === 'income')   wallet.balance += tx.amount;
    if (tx.type === 'expense')  wallet.balance -= tx.amount;
    if (tx.type === 'transfer') wallet.balance -= tx.amount;
  }
  if (tx.type === 'transfer' && tx.walletToId) {
    const walletTo = AppState.wallets.find(w => w.id === tx.walletToId);
    if (walletTo) walletTo.balance += tx.amount;
  }
}

// ============================================================
// 7. VIEW NAVIGATION
// ============================================================

let _currentView = 'dashboard';

/**
 * Ganti view yang ditampilkan & update active state bottom nav.
 * @param {string} viewName - 'dashboard' | 'transaksi' | 'dompet' | 'pengaturan'
 */
function switchView(viewName) {
  // Sembunyikan semua view
  document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));

  // Tampilkan view yang dipilih
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove('hidden');

  // Update active state nav button
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isActive = btn.dataset.nav === viewName;
    btn.classList.toggle('text-emerald-500', isActive);
    btn.classList.toggle('text-slate-400',   !isActive);
  });

  _currentView = viewName;

  // Trigger render untuk view yang baru aktif
  if (typeof UI !== 'undefined') {
    switch (viewName) {
      case 'dashboard':   UI.renderDashboard();   break;
      case 'transaksi':   UI.renderTransaksi();   break;
      case 'dompet':      UI.renderDompet();      break;
      case 'pengaturan':  UI.renderPengaturan();  break;
    }
  }
}

// ============================================================
// 9. CATEGORY CRUD
// ============================================================

/**
 * Tambah kategori kustom baru.
 * @param {string} type  - 'income' | 'expense'
 * @param {string} name  - nama kategori
 * @returns {object|null} kategori baru, atau null jika duplikat
 */
function addCategory(type, name) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // Cek duplikat (case-insensitive)
  const exists = AppState.categories[type]
    .some(c => c.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) return null;

  const cat = {
    id:        `cat_custom_${generateId()}`,
    name:      trimmed,
    icon:      type === 'income' ? 'circle-dollar-sign' : 'tag',
    isDefault: false,
  };
  AppState.categories[type].push(cat);
  saveState();
  return cat;
}

/**
 * Hapus kategori kustom.
 * Kategori default tidak bisa dihapus.
 * Transaksi terkait dialihkan ke kategori "Lainnya".
 * @param {string} catId
 * @returns {boolean}
 */
function deleteCategory(catId) {
  // Cari di expense & income
  let type = null;
  let idx  = AppState.categories.expense.findIndex(c => c.id === catId);
  if (idx !== -1) {
    type = 'expense';
  } else {
    idx = AppState.categories.income.findIndex(c => c.id === catId);
    if (idx !== -1) type = 'income';
  }

  if (!type || idx === -1) return false;

  const cat = AppState.categories[type][idx];
  if (cat.isDefault) return false; // tidak boleh hapus default

  // Alihkan transaksi ke "Lainnya"
  const fallbackId = type === 'expense' ? 'cat_lainnya_exp' : 'cat_lainnya_inc';
  AppState.transactions.forEach(tx => {
    if (tx.categoryId === catId) tx.categoryId = fallbackId;
  });

  AppState.categories[type].splice(idx, 1);
  saveState();
  return true;
}

// ============================================================
// 10. DATA MANAGEMENT (Export / Import / Clear)
// ============================================================

/**
 * Export seluruh AppState ke file .json dan trigger download.
 */
function exportJSON() {
  const payload = {
    version:      '1.0.0',
    exportedAt:   new Date().toISOString(),
    wallets:      AppState.wallets,
    categories:   AppState.categories,
    transactions: AppState.transactions,
    settings:     AppState.settings,
  };

  const blob     = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url      = URL.createObjectURL(blob);
  const date     = new Date().toISOString().slice(0, 10);
  _triggerDownload(url, `catatuang-backup-${date}.json`);
  URL.revokeObjectURL(url);
}

/**
 * Export daftar transaksi ke file .csv dan trigger download.
 * Format: id, tanggal, tipe, nominal, kategori, dompet, dompet_tujuan, catatan
 */
function exportCSV() {
  const header = ['ID', 'Tanggal', 'Tipe', 'Nominal', 'Kategori', 'Dompet', 'Dompet Tujuan', 'Catatan'];

  const rows = AppState.transactions
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(tx => {
      const cat      = getCategoryById(tx.categoryId);
      const wallet   = getWalletById(tx.walletId);
      const walletTo = tx.walletToId ? getWalletById(tx.walletToId) : null;
      return [
        tx.id,
        new Date(tx.date).toLocaleString('id-ID'),
        tx.type,
        tx.amount,
        cat      ? cat.name      : '',
        wallet   ? wallet.name   : '',
        walletTo ? walletTo.name : '',
        tx.note  ? `"${tx.note.replace(/"/g, '""')}"` : '',
      ].join(',');
    });

  const csv  = [header.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM untuk Excel
  const url  = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  _triggerDownload(url, `catatuang-transaksi-${date}.csv`);
  URL.revokeObjectURL(url);
}

/**
 * Import data dari file .json backup CatatUang.
 * @param {File} file - File object dari <input type="file">
 * @param {function} onSuccess - callback saat berhasil
 * @param {function} onError   - callback saat gagal, menerima pesan error
 */
function importJSON(file, onSuccess, onError) {
  if (!file || !file.name.endsWith('.json')) {
    onError('File harus berformat .json');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Validasi struktur dasar
      if (!data.wallets || !data.categories || !data.transactions) {
        onError('Format file tidak valid. Pastikan file berasal dari backup CatatUang.');
        return;
      }

      // Terapkan ke AppState
      AppState.wallets      = Array.isArray(data.wallets)      ? data.wallets      : [];
      AppState.categories   = data.categories;
      AppState.transactions = Array.isArray(data.transactions) ? data.transactions : [];
      AppState.settings     = data.settings || { ...DEFAULT_SETTINGS };

      saveState();
      onSuccess();
    } catch {
      onError('File tidak bisa dibaca. Pastikan file tidak rusak.');
    }
  };
  reader.readAsText(file);
}

/**
 * Hapus semua data dan reset ke kondisi awal (default data).
 */
function clearAllData() {
  Storage.clear();
  initDefaultData();
  if (typeof AppChart !== 'undefined') AppChart.destroy();
}

/** Internal — buat elemen <a> sementara dan trigger download */
function _triggerDownload(url, filename) {
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ============================================================
// 11. INISIALISASI APP
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Load atau seed data
  if (Storage.isFirstLaunch()) {
    initDefaultData();
  } else {
    loadState();
  }

  // Tampilkan dashboard sebagai view awal
  switchView('dashboard');

  // Handle shortcut dari manifest PWA
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'add-transaction') {
    setTimeout(() => UI.openTxModal(), 300);
  }

  // Register Service Worker (PWA)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.info('[SW] Service Worker terdaftar.'))
      .catch(err => console.warn('[SW] Gagal mendaftar:', err));
  }

  console.info('[App] CatatUang siap.');
});
