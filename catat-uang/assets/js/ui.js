/**
 * ui.js — DOM Manipulation & Renderers CatatUang
 * Urutan load: storage.js → app.js → ui.js → chart.js
 */

const UI = {

  // ============================================================
  // DASHBOARD
  // ============================================================

  renderDashboard() {
    // Update label bulan di chart card
    const chartMonthEl = document.getElementById('dashboard-chart-month');
    if (chartMonthEl) {
      chartMonthEl.textContent = formatMonthYear(AppState.filter.month, AppState.filter.year);
    }
    this._updateDashboardSummary();
    this._renderRecentTransactions();
    this.renderDashboardBudget();
    if (typeof AppChart !== 'undefined') {
      AppChart.updateExpensesChart(this._getExpenseChartData());
    }
    lucide.createIcons();
  },

  _updateDashboardSummary() {
    const { month, year } = AppState.filter;

    // Total saldo semua dompet
    const totalSaldo = AppState.wallets.reduce((sum, w) => sum + w.balance, 0);

    // Transaksi bulan berjalan
    const txBulanIni = AppState.transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const totalPemasukan   = txBulanIni
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalPengeluaran = txBulanIni
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    document.getElementById('dashboard-total-saldo').textContent       = formatRupiah(totalSaldo);
    document.getElementById('dashboard-total-pemasukan').textContent   = formatRupiah(totalPemasukan);
    document.getElementById('dashboard-total-pengeluaran').textContent = formatRupiah(totalPengeluaran);
  },

  _renderRecentTransactions() {
    const container = document.getElementById('dashboard-recent-list');
    if (!container) return;

    const recent = [...AppState.transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (recent.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-400 text-sm">
          <i data-lucide="receipt" class="w-10 h-10 mx-auto mb-2 text-slate-300"></i>
          Belum ada transaksi
        </div>`;
      return;
    }

    container.innerHTML = recent.map(tx => this._txItemHTML(tx)).join('');
  },

  _getExpenseChartData() {
    const { month, year } = AppState.filter;

    const expenses = AppState.transactions.filter(tx => {
      const d = new Date(tx.date);
      return tx.type === 'expense' && d.getMonth() === month && d.getFullYear() === year;
    });

    // Kelompokkan per kategori
    const map = {};
    expenses.forEach(tx => {
      map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
    });

    return Object.entries(map).map(([catId, amount]) => {
      const cat = getCategoryById(catId);
      return { label: cat ? cat.name : 'Lainnya', amount };
    });
  },

  // ============================================================
  // TRANSAKSI
  // ============================================================

  // State filter transaksi
  _txFilter: {
    type:       'all',    // 'all' | 'expense' | 'income' | 'transfer'
    categoryId: null,     // null = semua kategori
    search:     '',       // keyword pencarian
  },

  renderTransaksi() {
    this._updateFilterLabel();
    this._renderCategoryFilterChips();
    this._renderTransactionList();
    lucide.createIcons();
  },

  _updateFilterLabel() {
    const el = document.getElementById('filter-month-label');
    if (el) el.textContent = formatMonthYear(AppState.filter.month, AppState.filter.year);
  },

  /** Render chip kategori secara dinamis berdasarkan kategori expense yang ada */
  _renderCategoryFilterChips() {
    const container = document.getElementById('tx-filter-category-chips');
    if (!container) return;

    const cats = AppState.categories.expense;
    container.innerHTML = cats.map(cat => {
      const isActive = this._txFilter.categoryId === cat.id;
      return `
        <button data-filter-cat="${cat.id}"
                class="tx-filter-cat-chip flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all
                       ${isActive
                         ? 'bg-rose-500 text-white border-rose-500'
                         : 'bg-white text-slate-500 border-slate-200 hover:border-rose-300'}">
          <i data-lucide="${cat.icon}" class="w-3 h-3"></i>
          ${this._escapeHTML(cat.name)}
        </button>`;
    }).join('');
    lucide.createIcons();
  },

  /** Update active state chip tipe */
  _updateTypeChips() {
    document.querySelectorAll('.tx-filter-chip').forEach(btn => {
      const isActive = btn.dataset.filterType === this._txFilter.type;
      btn.classList.toggle('bg-emerald-500',  isActive);
      btn.classList.toggle('text-white',       isActive);
      btn.classList.toggle('border-emerald-500', isActive);
      btn.classList.toggle('bg-white',         !isActive);
      btn.classList.toggle('text-slate-500',   !isActive);
      btn.classList.toggle('border-slate-200', !isActive);
    });
  },

  _renderTransactionList() {
    const container = document.getElementById('transaksi-list');
    if (!container) return;

    const { month, year }                    = AppState.filter;
    const { type, categoryId, search }       = this._txFilter;
    const keyword = search.toLowerCase().trim();

    let filtered = AppState.transactions.filter(tx => {
      const d = new Date(tx.date);
      // Filter bulan
      if (d.getMonth() !== month || d.getFullYear() !== year) return false;
      // Filter tipe
      if (type !== 'all' && tx.type !== type) return false;
      // Filter kategori
      if (categoryId && tx.categoryId !== categoryId) return false;
      // Search keyword
      if (keyword) {
        const cat    = getCategoryById(tx.categoryId);
        const wallet = getWalletById(tx.walletId);
        const haystack = [
          cat    ? cat.name    : '',
          wallet ? wallet.name : '',
          tx.note || '',
          String(tx.amount),
        ].join(' ').toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Empty state
    if (filtered.length === 0) {
      const isFiltered = type !== 'all' || categoryId || keyword;
      container.innerHTML = `
        <div class="text-center py-12 text-slate-400 text-sm">
          <i data-lucide="${isFiltered ? 'search-x' : 'receipt'}" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
          ${isFiltered ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi bulan ini'}
          ${isFiltered ? `<p class="mt-2"><button onclick="UI._resetTxFilter()" class="text-emerald-500 font-medium text-xs">Reset filter</button></p>` : ''}
        </div>`;
      lucide.createIcons();
      return;
    }

    // Kelompokkan per hari
    const groups = {};
    filtered.forEach(tx => {
      const key = new Date(tx.date).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });

    container.innerHTML = Object.entries(groups).map(([dateKey, txs]) => `
      <div class="mb-4">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
          ${formatDateLong(dateKey)}
        </p>
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
          ${txs.map(tx => this._txItemHTML(tx)).join('')}
        </div>
      </div>
    `).join('');
    lucide.createIcons();
  },

  _resetTxFilter() {
    this._txFilter = { type: 'all', categoryId: null, search: '' };
    const searchInput = document.getElementById('input-tx-search');
    if (searchInput) searchInput.value = '';
    document.getElementById('btn-clear-search')?.classList.add('hidden');
    this._updateTypeChips();
    this._renderCategoryFilterChips();
    this._renderTransactionList();
  },

  // ============================================================
  // DOMPET
  // ============================================================

  renderDompet() {
    this._updateDompetHeader();
    this._renderDompetGrid();
    lucide.createIcons();
  },

  _updateDompetHeader() {
    const total = AppState.wallets.reduce((sum, w) => sum + w.balance, 0);
    const el = document.getElementById('dompet-total-saldo');
    if (el) el.textContent = formatRupiah(total);
  },

  _renderDompetGrid() {
    const container = document.getElementById('dompet-list');
    if (!container) return;

    if (AppState.wallets.length === 0) {
      container.innerHTML = `
        <div class="col-span-2 text-center py-12 text-slate-400 text-sm">
          <i data-lucide="wallet" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
          <p class="font-medium text-slate-500 mb-1">Belum ada dompet</p>
          <p>Tambahkan dompet pertamamu!</p>
        </div>`;
      return;
    }

    container.innerHTML = AppState.wallets.map(wallet => `
      <div class="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow"
           onclick="UI.onWalletTap('${wallet.id}')">
        <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
          <i data-lucide="${wallet.icon || 'wallet'}" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-xs text-slate-400 truncate">${this._escapeHTML(wallet.name)}</p>
          <p class="text-sm font-bold text-slate-800 mt-0.5">${formatRupiah(wallet.balance)}</p>
        </div>
      </div>
    `).join('');
  },

  onWalletTap(walletId) {
    const wallet = getWalletById(walletId);
    if (wallet) this.openDompetModal(wallet);
  },

  // ============================================================
  // MODAL DOMPET
  // ============================================================

  // Set ikon yang tersedia untuk dipilih
  _WALLET_ICONS: [
    'wallet', 'credit-card', 'banknote', 'piggy-bank', 'landmark',
    'smartphone', 'shopping-bag', 'briefcase', 'coins', 'dollar-sign',
    'star', 'heart', 'home', 'car', 'gift',
  ],

  _selectedIcon: 'wallet',
  _editingWalletId: null,

  openDompetModal(wallet = null) {
    try {
      this._editingWalletId = wallet ? wallet.id : null;

    // Reset form
    document.getElementById('input-dompet-nama').value  = wallet ? wallet.name  : '';
    document.getElementById('input-dompet-saldo').value = '';
    document.getElementById('error-dompet-nama').classList.add('hidden');
    document.getElementById('error-dompet-saldo').classList.add('hidden');

    // Judul modal
    document.getElementById('modal-dompet-title').textContent =
      wallet ? 'Edit Dompet' : 'Tambah Dompet';

    // Saldo awal hanya tampil saat tambah baru
    document.getElementById('field-saldo-awal').classList.toggle('hidden', !!wallet);

    // Tombol hapus hanya tampil saat edit
    document.getElementById('btn-hapus-dompet').classList.toggle('hidden', !wallet);

    // Icon picker
    this._selectedIcon = wallet ? (wallet.icon || 'wallet') : 'wallet';
    this._renderIconPicker();

    // Tampilkan modal
    const backdrop = document.getElementById('modal-dompet-backdrop');
    const modal    = document.getElementById('modal-dompet');
    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('modal-enter');
    setTimeout(() => modal.classList.remove('modal-enter'), 300);

    lucide.createIcons();
    document.getElementById('input-dompet-nama').focus();
    } catch(e) { console.error('[UI.openDompetModal] Error:', e); }
  },

  closeDompetModal() {
    const backdrop = document.getElementById('modal-dompet-backdrop');
    const modal    = document.getElementById('modal-dompet');
    modal.classList.add('modal-leave');
    setTimeout(() => {
      modal.classList.remove('modal-leave');
      modal.classList.add('hidden');
      backdrop.classList.add('hidden');
      UI._editingWalletId = null;
    }, 200);
  },

  _renderIconPicker() {
    const container = document.getElementById('icon-picker');
    if (!container) return;
    container.innerHTML = this._WALLET_ICONS.map(icon => `
      <button type="button" onclick="UI._selectIcon('${icon}')"
        id="icon-btn-${icon}"
        class="icon-btn w-full aspect-square flex items-center justify-center rounded-xl border-2 transition-all
               ${icon === this._selectedIcon
                 ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                 : 'border-slate-100 bg-white text-slate-400 hover:border-emerald-200'}">
        <i data-lucide="${icon}" class="w-5 h-5"></i>
      </button>
    `).join('');
    lucide.createIcons();
  },

  _selectIcon(icon) {
    this._selectedIcon = icon;
    // Update tampilan semua tombol icon tanpa re-render penuh
    this._WALLET_ICONS.forEach(ic => {
      const btn = document.getElementById(`icon-btn-${ic}`);
      if (!btn) return;
      const isActive = ic === icon;
      btn.className = btn.className
        .replace(/border-emerald-500|bg-emerald-50|text-emerald-600|border-slate-100|bg-white|text-slate-400|hover:border-emerald-200/g, '')
        .trim();
      btn.classList.add(
        'icon-btn', 'w-full', 'aspect-square', 'flex', 'items-center', 'justify-center',
        'rounded-xl', 'border-2', 'transition-all',
        ...(isActive
          ? ['border-emerald-500', 'bg-emerald-50', 'text-emerald-600']
          : ['border-slate-100', 'bg-white', 'text-slate-400', 'hover:border-emerald-200'])
      );
    });
  },

  onSimpanDompet() {
    const nama  = document.getElementById('input-dompet-nama').value.trim();
    const saldo = parseFloat(document.getElementById('input-dompet-saldo').value) || 0;

    // Validasi nama
    let valid = true;
    if (!nama) {
      document.getElementById('error-dompet-nama').classList.remove('hidden');
      valid = false;
    } else {
      document.getElementById('error-dompet-nama').classList.add('hidden');
    }

    // Validasi saldo (hanya saat tambah baru)
    if (!this._editingWalletId && saldo < 0) {
      document.getElementById('error-dompet-saldo').classList.remove('hidden');
      valid = false;
    } else {
      document.getElementById('error-dompet-saldo').classList.add('hidden');
    }

    if (!valid) return;

    if (this._editingWalletId) {
      editWallet(this._editingWalletId, { name: nama, icon: this._selectedIcon });
    } else {
      addWallet({ name: nama, icon: this._selectedIcon, balance: saldo });
    }

    this.closeDompetModal();
    // Refresh semua view yang terpengaruh
    this.renderDompet();
    this._updateDashboardSummary();
    this.showToast(this._editingWalletId ? 'Dompet berhasil diperbarui' : 'Dompet berhasil ditambahkan');
  },

  onHapusDompet() {
    const walletId = this._editingWalletId;
    if (!walletId) return;

    if (walletHasTransactions(walletId)) {
      this.showKonfirmasi({
        title:   'Tidak Bisa Dihapus',
        message: 'Dompet ini masih memiliki riwayat transaksi. Hapus transaksi terkait terlebih dahulu.',
        label:   'Mengerti',
        danger:  false,
        onOk:    () => this.closeKonfirmasi(),
      });
      return;
    }

    const wallet = getWalletById(walletId);
    this.showKonfirmasi({
      title:   'Hapus Dompet?',
      message: `Dompet "${wallet ? wallet.name : ''}" akan dihapus permanen.`,
      label:   'Hapus',
      danger:  true,
      onOk:    () => {
        deleteWallet(walletId);
        this.closeKonfirmasi();
        this.closeDompetModal();
        this.renderDompet();
        this._updateDashboardSummary();
        this.showToast('Dompet berhasil dihapus');
      },
    });
  },

  // ============================================================
  // MODAL KONFIRMASI (reusable)
  // ============================================================

  _konfirmasiCallback: null,

  showKonfirmasi({ title, message, label = 'Hapus', danger = true, onOk }) {
    document.getElementById('konfirmasi-title').textContent   = title;
    document.getElementById('konfirmasi-message').textContent = message;

    const okBtn = document.getElementById('btn-konfirmasi-ok');
    okBtn.textContent = label;
    okBtn.className   = okBtn.className.replace(/bg-\w+-\d+|hover:bg-\w+-\d+/g, '').trim();
    okBtn.classList.add(
      danger ? 'bg-rose-500' : 'bg-emerald-500',
      danger ? 'hover:bg-rose-600' : 'hover:bg-emerald-600'
    );

    this._konfirmasiCallback = onOk;
    document.getElementById('modal-konfirmasi-backdrop').classList.remove('hidden');
  },

  closeKonfirmasi() {
    document.getElementById('modal-konfirmasi-backdrop').classList.add('hidden');
    this._konfirmasiCallback = null;
  },

  // ============================================================
  // MODAL BUDGET
  // ============================================================

  openBudgetModal() {
    this._renderBudgetList();

    const backdrop = document.getElementById('modal-budget-backdrop');
    const modal    = document.getElementById('modal-budget');
    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('modal-enter');
    setTimeout(() => modal.classList.remove('modal-enter'), 300);
    lucide.createIcons();
  },

  closeBudgetModal() {
    const backdrop = document.getElementById('modal-budget-backdrop');
    const modal    = document.getElementById('modal-budget');
    modal.classList.add('modal-leave');
    setTimeout(() => {
      modal.classList.remove('modal-leave');
      modal.classList.add('hidden');
      backdrop.classList.add('hidden');
    }, 200);
  },

  _renderBudgetList() {
    const container = document.getElementById('budget-category-list');
    if (!container) return;

    const cats = AppState.categories.expense;

    if (cats.length === 0) {
      container.innerHTML = `<p class="text-sm text-slate-400 text-center py-6">Belum ada kategori pengeluaran.</p>`;
      return;
    }

    container.innerHTML = cats.map(cat => {
      const current = AppState.budgets[cat.id] || '';
      const { month, year } = AppState.filter;
      const spent   = getSpentForCategory(cat.id, month, year);
      const hasBudget = !!AppState.budgets[cat.id];

      return `
        <div class="bg-slate-50 rounded-2xl p-3">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-100 text-rose-600 flex-shrink-0">
              <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-700">${this._escapeHTML(cat.name)}</p>
              ${hasBudget
                ? `<p class="text-xs text-slate-400">Terpakai: ${formatRupiah(spent)}</p>`
                : `<p class="text-xs text-slate-400">Belum ada budget</p>`
              }
            </div>
          </div>
          <div class="flex gap-2 items-center">
            <div class="relative flex-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">Rp</span>
              <input type="number" min="0" placeholder="Tidak dibatasi"
                     value="${current}"
                     data-cat-id="${cat.id}"
                     class="budget-input w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-300" />
            </div>
            <button onclick="UI._saveBudgetItem('${cat.id}')"
                    class="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors btn-ripple flex-shrink-0">
              Simpan
            </button>
            ${hasBudget
              ? `<button onclick="UI._deleteBudgetItem('${cat.id}')"
                         class="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors flex-shrink-0">
                   <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                 </button>`
              : ''
            }
          </div>
        </div>`;
    }).join('');

    lucide.createIcons();
  },

  _saveBudgetItem(catId) {
    const input  = document.querySelector(`.budget-input[data-cat-id="${catId}"]`);
    if (!input) return;
    const amount = parseFloat(input.value) || 0;
    setBudget(catId, amount);
    this._renderBudgetList();
    this.renderDashboardBudget();
    this.showToast(amount > 0 ? 'Budget berhasil disimpan' : 'Budget dihapus');
  },

  _deleteBudgetItem(catId) {
    setBudget(catId, 0);
    this._renderBudgetList();
    this.renderDashboardBudget();
    this.showToast('Budget dihapus');
  },

  // ============================================================
  // DASHBOARD BUDGET SECTION
  // ============================================================

  renderDashboardBudget() {
    const card      = document.getElementById('dashboard-budget-card');
    const list      = document.getElementById('dashboard-budget-list');
    const monthEl   = document.getElementById('dashboard-budget-month');
    if (!card || !list) return;

    const { month, year } = AppState.filter;
    const summary = getBudgetSummary(month, year);

    // Sembunyikan card kalau tidak ada budget sama sekali
    if (summary.length === 0) {
      card.classList.add('hidden');
      return;
    }

    card.classList.remove('hidden');
    if (monthEl) monthEl.textContent = formatMonthYear(month, year);

    list.innerHTML = summary.map(({ cat, budget, spent, pct, status }) => {
      const barColor = status === 'over'
        ? 'bg-rose-500'
        : status === 'warning'
          ? 'bg-amber-400'
          : 'bg-emerald-500';

      const labelColor = status === 'over'
        ? 'text-rose-600'
        : status === 'warning'
          ? 'text-amber-600'
          : 'text-slate-500';

      const statusBadge = status === 'over'
        ? `<span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">Melebihi!</span>`
        : status === 'warning'
          ? `<span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Hampir habis</span>`
          : '';

      return `
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center bg-rose-100 text-rose-600">
                <i data-lucide="${cat.icon}" class="w-3.5 h-3.5"></i>
              </div>
              <span class="text-sm font-medium text-slate-700">${this._escapeHTML(cat.name)}</span>
              ${statusBadge}
            </div>
            <span class="text-xs font-semibold ${labelColor}">${pct.toFixed(0)}%</span>
          </div>
          <!-- Progress bar -->
          <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="${barColor} h-full rounded-full transition-all duration-500"
                 style="width:${pct}%"></div>
          </div>
          <div class="flex justify-between mt-1">
            <span class="text-xs text-slate-400">${formatRupiah(spent)}</span>
            <span class="text-xs text-slate-400">dari ${formatRupiah(budget)}</span>
          </div>
        </div>`;
    }).join('');

    lucide.createIcons();
  },

  // ============================================================
  // MODAL KATEGORI
  // ============================================================

  _katType: 'expense',

  openKategoriModal() {
    this._katType = 'expense';
    document.getElementById('input-kat-nama').value = '';
    document.getElementById('error-kat-nama').classList.add('hidden');

    this._renderKatTypeButtons();
    this._renderKatLists();

    const backdrop = document.getElementById('modal-kategori-backdrop');
    const modal    = document.getElementById('modal-kategori');
    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('modal-enter');
    setTimeout(() => modal.classList.remove('modal-enter'), 300);
    lucide.createIcons();
  },

  closeKategoriModal() {
    const backdrop = document.getElementById('modal-kategori-backdrop');
    const modal    = document.getElementById('modal-kategori');
    modal.classList.add('modal-leave');
    setTimeout(() => {
      modal.classList.remove('modal-leave');
      modal.classList.add('hidden');
      backdrop.classList.add('hidden');
    }, 200);
  },

  setKatType(type) {
    this._katType = type;
    this._renderKatTypeButtons();
  },

  _renderKatTypeButtons() {
    ['expense', 'income'].forEach(t => {
      const btn = document.getElementById(`kat-type-${t}`);
      if (!btn) return;
      const active = t === this._katType;
      btn.classList.toggle('bg-emerald-500',  active);
      btn.classList.toggle('text-white',      active);
      btn.classList.toggle('shadow-sm',       active);
      btn.classList.toggle('text-slate-500',  !active);
    });
  },

  _renderKatLists() {
    ['expense', 'income'].forEach(type => {
      const container = document.getElementById(`kat-list-${type}`);
      if (!container) return;

      const cats = AppState.categories[type];
      if (cats.length === 0) {
        container.innerHTML = `<p class="px-4 py-3 text-sm text-slate-400">Belum ada kategori.</p>`;
        return;
      }

      container.innerHTML = cats.map(cat => `
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                      ${type === 'income' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}">
            <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
          </div>
          <span class="flex-1 text-sm font-medium text-slate-700">${this._escapeHTML(cat.name)}</span>
          ${cat.isDefault
            ? `<span class="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Default</span>`
            : `<button onclick="UI._konfirmasiHapusKategori('${cat.id}')"
                       class="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                 <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
               </button>`
          }
        </div>
      `).join('');

      lucide.createIcons();
    });
  },

  onTambahKategori() {
    const nama = document.getElementById('input-kat-nama').value.trim();
    const errorEl = document.getElementById('error-kat-nama');

    if (!nama) {
      errorEl.classList.remove('hidden');
      return;
    }

    const result = addCategory(this._katType, nama);
    if (!result) {
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    document.getElementById('input-kat-nama').value = '';
    this._renderKatLists();
    this.showToast('Kategori berhasil ditambahkan');

    // Refresh pill kategori di modal transaksi jika sedang terbuka
    this._renderCategoryPills();
  },

  _konfirmasiHapusKategori(catId) {
    const all = [...AppState.categories.expense, ...AppState.categories.income];
    const cat = all.find(c => c.id === catId);
    if (!cat) return;

    this.showKonfirmasi({
      title:   'Hapus Kategori?',
      message: `Kategori "${cat.name}" akan dihapus. Transaksi terkait akan dialihkan ke "Lainnya".`,
      label:   'Hapus',
      danger:  true,
      onOk: () => {
        deleteCategory(catId);
        this.closeKonfirmasi();
        this._renderKatLists();
        // Refresh chart & summary karena label bisa berubah
        if (typeof AppChart !== 'undefined') {
          AppChart.updateExpensesChart(this._getExpenseChartData());
        }
      },
    });
  },

  // ============================================================
  // PENGATURAN
  // ============================================================

  renderPengaturan() {
    lucide.createIcons();
  },

  // ============================================================
  // SHARED HELPERS
  // ============================================================

  /**
   * Render satu baris item transaksi.
   * Dipakai di dashboard (recent) dan halaman transaksi.
   */
  _txItemHTML(tx) {
    const cat    = getCategoryById(tx.categoryId);
    const wallet = getWalletById(tx.walletId);
    const isIncome   = tx.type === 'income';
    const isTransfer = tx.type === 'transfer';

    const amountColor  = isIncome ? 'text-green-600' : isTransfer ? 'text-blue-600' : 'text-rose-600';
    const amountPrefix = isIncome ? '+' : isTransfer ? '⇄' : '-';
    const iconName     = isTransfer ? 'arrow-left-right' : (cat ? cat.icon : 'circle');
    const iconBg       = isIncome ? 'bg-green-100 text-green-600' : isTransfer ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600';

    return `
      <div class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
           onclick="UI.onTransactionTap('${tx.id}')">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}">
          <i data-lucide="${iconName}" class="w-5 h-5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-800 truncate">
            ${cat ? this._escapeHTML(cat.name) : 'Kategori Dihapus'}
          </p>
          <p class="text-xs text-slate-400 truncate">
            ${wallet ? this._escapeHTML(wallet.name) : '—'}
            ${tx.note ? ' · ' + this._escapeHTML(tx.note) : ''}
          </p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-sm font-semibold ${amountColor}">
            ${amountPrefix}${formatRupiah(tx.amount)}
          </p>
          <p class="text-xs text-slate-400">${formatDateShort(tx.date)}</p>
        </div>
      </div>`;
  },

  onTransactionTap(txId) {
    const tx = AppState.transactions.find(t => t.id === txId);
    if (tx) UI.openTxModal(tx);
  },

  // ============================================================
  // MODAL TRANSAKSI
  // ============================================================

  _txType:          'expense',
  _txCategoryId:    null,
  _txWalletId:      null,
  _txWalletToId:    null,
  _editingTxId:     null,

  openTxModal(tx = null) {
    this._editingTxId  = tx ? tx.id : null;
    this._txType       = tx ? tx.type : 'expense';
    this._txCategoryId = tx ? tx.categoryId : null;
    this._txWalletId   = tx ? tx.walletId   : null;
    this._txWalletToId = tx ? (tx.walletToId || null) : null;

    // Judul
    document.getElementById('modal-tx-title').textContent =
      tx ? 'Edit Transaksi' : 'Tambah Transaksi';

    // Nominal
    document.getElementById('input-tx-amount').value = tx ? tx.amount : '';

    // Catatan
    document.getElementById('input-tx-note').value = tx ? (tx.note || '') : '';

    // Tanggal — format ke datetime-local (YYYY-MM-DDTHH:mm)
    const now   = new Date();
    const toLocal = (d) => {
      const dt = new Date(d);
      const pad = n => String(n).padStart(2, '0');
      return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    };
    document.getElementById('input-tx-date').value = toLocal(tx ? tx.date : now);

    // Tombol hapus hanya saat edit
    document.getElementById('btn-hapus-tx').classList.toggle('hidden', !tx);

    // Reset error
    ['error-tx-amount','error-tx-category','error-tx-wallet','error-tx-wallet-to','error-tx-same-wallet']
      .forEach(id => document.getElementById(id)?.classList.add('hidden'));

    // Render segmented control + pills
    this._renderTxTypeButtons();
    this._renderCategoryPills();
    this._renderWalletPills();

    // Tampilkan modal
    const backdrop = document.getElementById('modal-transaksi-backdrop');
    const modal    = document.getElementById('modal-transaksi');
    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('modal-enter');
    setTimeout(() => modal.classList.remove('modal-enter'), 300);

    lucide.createIcons();
    document.getElementById('input-tx-amount').focus();
  },

  closeTxModal() {
    const backdrop = document.getElementById('modal-transaksi-backdrop');
    const modal    = document.getElementById('modal-transaksi');
    modal.classList.add('modal-leave');
    setTimeout(() => {
      modal.classList.remove('modal-leave');
      modal.classList.add('hidden');
      backdrop.classList.add('hidden');
      UI._editingTxId = null;
    }, 200);
  },

  setTxType(type) {
    this._txType       = type;
    this._txCategoryId = null; // reset pilihan kategori saat ganti tipe
    this._renderTxTypeButtons();
    this._renderCategoryPills();
    this._renderWalletPills();
  },

  _renderTxTypeButtons() {
    const types = ['expense', 'income', 'transfer'];
    const activeClass   = ['bg-white', 'text-emerald-600', 'shadow-sm'];
    const inactiveClass = ['text-slate-500'];

    types.forEach(t => {
      const btn = document.getElementById(`tx-type-${t}`);
      if (!btn) return;
      activeClass.forEach(c   => btn.classList.toggle(c, t === this._txType));
      inactiveClass.forEach(c => btn.classList.toggle(c, t !== this._txType));
    });

    // Tampilkan/sembunyikan field kategori & dompet tujuan
    const isTransfer = this._txType === 'transfer';
    document.getElementById('field-tx-category').classList.toggle('hidden', isTransfer);
    document.getElementById('field-tx-wallet-to').classList.toggle('hidden', !isTransfer);
    document.getElementById('label-tx-wallet').textContent = isTransfer ? 'Dompet Asal' : 'Dompet';
  },

  _renderCategoryPills() {
    const container = document.getElementById('tx-category-list');
    if (!container) return;

    const cats = this._txType === 'income'
      ? AppState.categories.income
      : AppState.categories.expense;

    if (cats.length === 0) {
      container.innerHTML = `<p class="col-span-3 text-xs text-slate-400">Belum ada kategori.</p>`;
      return;
    }

    container.innerHTML = cats.map(cat => {
      const isActive = cat.id === this._txCategoryId;
      return `
        <button type="button" onclick="UI._selectTxCategory('${cat.id}')"
          class="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-center
                 ${isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-white text-slate-500 hover:border-emerald-200'}">
          <i data-lucide="${cat.icon}" class="w-5 h-5"></i>
          <span class="text-[10px] font-medium leading-tight">${this._escapeHTML(cat.name)}</span>
        </button>`;
    }).join('');
    lucide.createIcons();
  },

  _selectTxCategory(catId) {
    this._txCategoryId = catId;
    this._renderCategoryPills();
    document.getElementById('error-tx-category')?.classList.add('hidden');
  },

  _renderWalletPills() {
    // Dompet asal
    const walletContainer = document.getElementById('tx-wallet-list');
    if (walletContainer) {
      if (AppState.wallets.length === 0) {
        walletContainer.innerHTML = `<p class="text-xs text-slate-400">Belum ada dompet. Tambah dompet dulu.</p>`;
      } else {
        walletContainer.innerHTML = AppState.wallets.map(w => {
          const isActive = w.id === this._txWalletId;
          return `
            <button type="button" onclick="UI._selectTxWallet('${w.id}')"
              class="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all text-sm
                     ${isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'}">
              <i data-lucide="${w.icon || 'wallet'}" class="w-4 h-4"></i>
              <span>${this._escapeHTML(w.name)}</span>
            </button>`;
        }).join('');
      }
    }

    // Dompet tujuan (transfer)
    const walletToContainer = document.getElementById('tx-wallet-to-list');
    if (walletToContainer) {
      walletToContainer.innerHTML = AppState.wallets.map(w => {
        const isActive = w.id === this._txWalletToId;
        return `
          <button type="button" onclick="UI._selectTxWalletTo('${w.id}')"
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all text-sm
                   ${isActive ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}">
            <i data-lucide="${w.icon || 'wallet'}" class="w-4 h-4"></i>
            <span>${this._escapeHTML(w.name)}</span>
          </button>`;
      }).join('');
    }

    lucide.createIcons();
  },

  _selectTxWallet(walletId) {
    this._txWalletId = walletId;
    this._renderWalletPills();
    document.getElementById('error-tx-wallet')?.classList.add('hidden');
  },

  _selectTxWalletTo(walletId) {
    this._txWalletToId = walletId;
    this._renderWalletPills();
    document.getElementById('error-tx-wallet-to')?.classList.add('hidden');
    document.getElementById('error-tx-same-wallet')?.classList.add('hidden');
  },

  onSimpanTx() {
    const amount    = parseFloat(document.getElementById('input-tx-amount').value);
    const dateValue = document.getElementById('input-tx-date').value;
    const note      = document.getElementById('input-tx-note').value;
    const isTransfer = this._txType === 'transfer';

    // Validasi
    let valid = true;

    if (!amount || amount <= 0) {
      document.getElementById('error-tx-amount').classList.remove('hidden');
      valid = false;
    } else {
      document.getElementById('error-tx-amount').classList.add('hidden');
    }

    if (!isTransfer && !this._txCategoryId) {
      document.getElementById('error-tx-category').classList.remove('hidden');
      valid = false;
    } else {
      document.getElementById('error-tx-category').classList.add('hidden');
    }

    if (!this._txWalletId) {
      document.getElementById('error-tx-wallet').classList.remove('hidden');
      valid = false;
    } else {
      document.getElementById('error-tx-wallet').classList.add('hidden');
    }

    if (isTransfer) {
      if (!this._txWalletToId) {
        document.getElementById('error-tx-wallet-to').classList.remove('hidden');
        valid = false;
      } else if (this._txWalletToId === this._txWalletId) {
        document.getElementById('error-tx-same-wallet').classList.remove('hidden');
        valid = false;
      } else {
        // Validasi saldo cukup untuk transfer
        const walletAsal = getWalletById(this._txWalletId);
        if (walletAsal && amount > walletAsal.balance) {
          document.getElementById('error-tx-wallet').classList.remove('hidden');
          document.getElementById('error-tx-wallet').textContent =
            `Saldo tidak cukup. Saldo ${walletAsal.name}: ${formatRupiah(walletAsal.balance)}`;
          valid = false;
        }
        document.getElementById('error-tx-wallet-to').classList.add('hidden');
        document.getElementById('error-tx-same-wallet').classList.add('hidden');
      }
    }

    if (!valid) return;

    const txData = {
      type:       this._txType,
      amount,
      categoryId: isTransfer ? null : this._txCategoryId,
      walletId:   this._txWalletId,
      walletToId: isTransfer ? this._txWalletToId : null,
      date:       dateValue ? new Date(dateValue).toISOString() : new Date().toISOString(),
      note,
    };

    if (this._editingTxId) {
      editTransaction(this._editingTxId, txData);
    } else {
      addTransaction(txData);
    }

    this.closeTxModal();
    this._refreshAllViews();
    this.showToast(this._editingTxId ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil disimpan');
  },

  onHapusTx() {
    const txId = this._editingTxId;
    if (!txId) return;

    this.showKonfirmasi({
      title:   'Hapus Transaksi?',
      message: 'Transaksi ini akan dihapus dan saldo dompet akan dikembalikan.',
      label:   'Hapus',
      danger:  true,
      onOk: () => {
        deleteTransaction(txId);
        this.closeKonfirmasi();
        this.closeTxModal();
        this._refreshAllViews();
        this.showToast('Transaksi berhasil dihapus');
      },
    });
  },

  /** Refresh semua view yang menampilkan data transaksi & saldo */
  _refreshAllViews() {
    this._updateDashboardSummary();
    this._renderRecentTransactions();
    this.renderDashboardBudget();
    if (typeof AppChart !== 'undefined') {
      AppChart.updateExpensesChart(this._getExpenseChartData());
    }
    this._renderTransactionList();
    this._updateDompetHeader();
    this._renderDompetGrid();
    lucide.createIcons();
  },

  /** Escape HTML untuk mencegah XSS dari data user */
  _escapeHTML(str = '') {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  // ============================================================
  // TOAST NOTIFICATION
  // ============================================================

  /**
   * Tampilkan pesan toast singkat di bagian bawah layar.
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   */
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const colors = {
      success: 'background:#0F172A',
      error:   'background:#E11D48',
      info:    'background:#3B82F6',
    };

    toast.textContent = `${icons[type] || '✓'}  ${message}`;
    toast.style.cssText = `${colors[type] || colors.success}`;
    toast.classList.add('show');

    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  },
  _toastTimer: null,

};

// ============================================================
// EVENT LISTENERS — Filter Bulan (Halaman Transaksi)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Tombol filter bulan di dashboard (chart card)
  document.getElementById('btn-dash-prev-month')?.addEventListener('click', () => {
    if (AppState.filter.month === 0) {
      AppState.filter.month = 11;
      AppState.filter.year -= 1;
    } else {
      AppState.filter.month -= 1;
    }
    UI.renderDashboard();
    UI._updateFilterLabel(); // sync label di halaman transaksi juga
  });

  document.getElementById('btn-dash-next-month')?.addEventListener('click', () => {
    if (AppState.filter.month === 11) {
      AppState.filter.month = 0;
      AppState.filter.year += 1;
    } else {
      AppState.filter.month += 1;
    }
    UI.renderDashboard();
    UI._updateFilterLabel();
  });

  // ── FILTER & SEARCH TRANSAKSI ─────────────────────────────

  // Search input
  document.getElementById('input-tx-search')?.addEventListener('input', (e) => {
    const val = e.target.value;
    UI._txFilter.search = val;
    document.getElementById('btn-clear-search')?.classList.toggle('hidden', !val);
    UI._renderTransactionList();
  });

  // Tombol clear search
  document.getElementById('btn-clear-search')?.addEventListener('click', () => {
    const input = document.getElementById('input-tx-search');
    if (input) input.value = '';
    UI._txFilter.search = '';
    document.getElementById('btn-clear-search').classList.add('hidden');
    UI._renderTransactionList();
    input?.focus();
  });

  // Filter chips tipe — pakai event delegation
  document.querySelectorAll('.tx-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      UI._txFilter.type = btn.dataset.filterType;
      UI._txFilter.categoryId = null; // reset kategori saat ganti tipe
      UI._updateTypeChips();
      UI._renderCategoryFilterChips();
      UI._renderTransactionList();
    });
  });

  // Filter chips kategori — event delegation di container
  document.getElementById('tx-filter-category-chips')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter-cat]');
    if (!btn) return;
    const catId = btn.dataset.filterCat;
    // Toggle: klik lagi untuk deselect
    UI._txFilter.categoryId = UI._txFilter.categoryId === catId ? null : catId;
    // Paksa tipe ke expense saat pilih kategori
    if (UI._txFilter.categoryId) UI._txFilter.type = 'expense';
    UI._updateTypeChips();
    UI._renderCategoryFilterChips();
    UI._renderTransactionList();
  });

  // Tombol bulan sebelumnya (halaman Transaksi)
  document.getElementById('btn-prev-month')?.addEventListener('click', () => {
    if (AppState.filter.month === 0) {
      AppState.filter.month = 11;
      AppState.filter.year -= 1;
    } else {
      AppState.filter.month -= 1;
    }
    UI._txFilter.search = '';
    UI._txFilter.categoryId = null;
    const si = document.getElementById('input-tx-search');
    if (si) si.value = '';
    document.getElementById('btn-clear-search')?.classList.add('hidden');
    UI.renderTransaksi();
  });

  document.getElementById('btn-next-month')?.addEventListener('click', () => {
    if (AppState.filter.month === 11) {
      AppState.filter.month = 0;
      AppState.filter.year += 1;
    } else {
      AppState.filter.month += 1;
    }
    UI._txFilter.search = '';
    UI._txFilter.categoryId = null;
    const si = document.getElementById('input-tx-search');
    if (si) si.value = '';
    document.getElementById('btn-clear-search')?.classList.add('hidden');
    UI.renderTransaksi();
  });

  // Tombol FAB — kontekstual sesuai view aktif
  document.getElementById('btn-fab-add')?.addEventListener('click', () => {
    if (_currentView === 'dompet') {
      UI.openDompetModal();
    } else {
      UI.openTxModal();
    }
  });

  // Tombol tambah dompet
  document.getElementById('btn-tambah-dompet')?.addEventListener('click', () => {
    UI.openDompetModal();
  });

  // Tombol kelola budget
  document.getElementById('btn-kelola-budget')?.addEventListener('click', () => {
    UI.openBudgetModal();
  });

  // Tombol kelola kategori
  document.getElementById('btn-kelola-kategori')?.addEventListener('click', () => {
    UI.openKategoriModal();
  });

  // ── DATA MANAGEMENT ──────────────────────────────────────

  // Export JSON
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    if (AppState.transactions.length === 0 && AppState.wallets.length === 0) {
      UI.showKonfirmasi({
        title:   'Tidak Ada Data',
        message: 'Belum ada data untuk diekspor.',
        label:   'Mengerti',
        danger:  false,
        onOk:    () => UI.closeKonfirmasi(),
      });
      return;
    }
    exportJSON();
    UI.showToast('Data berhasil diekspor ke JSON');
  });

  // Export CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    if (AppState.transactions.length === 0) {
      UI.showKonfirmasi({
        title:   'Tidak Ada Transaksi',
        message: 'Belum ada transaksi untuk diekspor ke CSV.',
        label:   'Mengerti',
        danger:  false,
        onOk:    () => UI.closeKonfirmasi(),
      });
      return;
    }
    exportCSV();
    UI.showToast('Data berhasil diekspor ke CSV');
  });

  // Import JSON
  document.getElementById('input-import-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    UI.showKonfirmasi({
      title:   'Import Data?',
      message: 'Data saat ini akan ditimpa dengan data dari file backup. Lanjutkan?',
      label:   'Import',
      danger:  true,
      onOk: () => {
        importJSON(
          file,
          // onSuccess
          () => {
            UI.closeKonfirmasi();
            UI._refreshAllViews();
            UI.showKonfirmasi({
              title:   'Import Berhasil',
              message: 'Data berhasil dimuat dari file backup.',
              label:   'Oke',
              danger:  false,
              onOk:    () => UI.closeKonfirmasi(),
            });
          },
          // onError
          (msg) => {
            UI.closeKonfirmasi();
            UI.showKonfirmasi({
              title:   'Import Gagal',
              message: msg,
              label:   'Mengerti',
              danger:  false,
              onOk:    () => UI.closeKonfirmasi(),
            });
          }
        );
        // Reset input agar file yang sama bisa dipilih lagi
        e.target.value = '';
      },
    });
    // Reset input setelah konfirmasi ditampilkan (bila user batal)
    e.target.value = '';
  });

  // Clear All Data — konfirmasi 2 langkah
  document.getElementById('btn-clear-data')?.addEventListener('click', () => {
    UI.showKonfirmasi({
      title:   'Hapus Semua Data?',
      message: 'Seluruh transaksi, dompet, dan kategori kustom akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.',
      label:   'Ya, Hapus Semua',
      danger:  true,
      onOk: () => {
        UI.closeKonfirmasi();
        // Konfirmasi kedua
        setTimeout(() => {
          UI.showKonfirmasi({
            title:   'Konfirmasi Terakhir',
            message: 'Benar-benar yakin? Semua data akan hilang.',
            label:   'Hapus Sekarang',
            danger:  true,
            onOk: () => {
              clearAllData();
              UI.closeKonfirmasi();
              UI._refreshAllViews();
              UI.showToast('Semua data berhasil dihapus');
            },
          });
        }, 250);
      },
    });
  });

  // Tombol OK konfirmasi
  document.getElementById('btn-konfirmasi-ok')?.addEventListener('click', () => {
    if (typeof UI._konfirmasiCallback === 'function') {
      UI._konfirmasiCallback();
    }
  });
});
