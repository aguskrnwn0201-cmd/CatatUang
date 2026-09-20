/**
 * storage.js — LocalStorage wrapper untuk CatatUang
 * Semua data aplikasi disimpan dengan prefix 'cu_' untuk menghindari konflik.
 */

const STORAGE_KEYS = {
  WALLETS:      'cu_wallets',
  CATEGORIES:   'cu_categories',
  TRANSACTIONS: 'cu_transactions',
  SETTINGS:     'cu_settings',
};

const Storage = {
  /**
   * Simpan data ke LocalStorage.
   * @param {string} key   - Salah satu dari STORAGE_KEYS
   * @param {*}      data  - Data apa saja (akan di-serialize ke JSON)
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`[Storage.save] Gagal menyimpan key "${key}":`, err);
    }
  },

  /**
   * Ambil data dari LocalStorage.
   * @param {string} key          - Salah satu dari STORAGE_KEYS
   * @param {*}      defaultValue - Nilai fallback jika key tidak ada
   * @returns {*} Data yang sudah di-parse, atau defaultValue
   */
  load(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch (err) {
      console.error(`[Storage.load] Gagal membaca key "${key}":`, err);
      return defaultValue;
    }
  },

  /**
   * Hapus satu entri dari LocalStorage.
   * @param {string} key - Key yang akan dihapus
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`[Storage.remove] Gagal menghapus key "${key}":`, err);
    }
  },

  /**
   * Hapus semua data aplikasi CatatUang (semua key cu_*).
   * Tidak menyentuh data localStorage dari domain/aplikasi lain.
   */
  clear() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (err) {
      console.error('[Storage.clear] Gagal menghapus semua data:', err);
    }
  },

  /**
   * Cek apakah aplikasi baru pertama kali dijalankan (belum ada data sama sekali).
   * @returns {boolean}
   */
  isFirstLaunch() {
    return localStorage.getItem(STORAGE_KEYS.SETTINGS) === null;
  },
};
