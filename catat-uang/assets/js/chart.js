/**
 * chart.js — Chart.js Integration untuk CatatUang
 * Urutan load: storage.js → app.js → ui.js → chart.js
 */

// Palet warna untuk kategori (hingga 12 kategori)
const CHART_COLORS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#6366F1', // indigo
  '#D946EF', // fuchsia
];

const AppChart = {
  _instance: null,

  /**
   * Render atau update donut chart pengeluaran per kategori.
   * Dipanggil dari UI.renderDashboard() setiap kali data berubah.
   * @param {Array} data - [{ label: string, amount: number }]
   */
  updateExpensesChart(data = []) {
    const canvas       = document.getElementById('expense-chart');
    const emptyState   = document.getElementById('chart-empty-state');
    const chartContainer = document.getElementById('chart-container');

    if (!canvas) return;

    // Tampilkan empty state jika tidak ada data
    if (data.length === 0) {
      if (emptyState)     emptyState.classList.remove('hidden');
      if (chartContainer) chartContainer.classList.add('hidden');

      // Hancurkan chart instance lama jika ada
      if (this._instance) {
        this._instance.destroy();
        this._instance = null;
      }
      return;
    }

    // Ada data — sembunyikan empty state
    if (emptyState)     emptyState.classList.add('hidden');
    if (chartContainer) chartContainer.classList.remove('hidden');

    const labels     = data.map(d => d.label);
    const amounts    = data.map(d => d.amount);
    const colors     = data.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
    const total      = amounts.reduce((a, b) => a + b, 0);

    // Update chart yang sudah ada, atau buat baru
    if (this._instance) {
      this._instance.data.labels              = labels;
      this._instance.data.datasets[0].data    = amounts;
      this._instance.data.datasets[0].backgroundColor = colors;
      this._instance.update('active');
      return;
    }

    // Buat chart baru
    this._instance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data:            amounts,
          backgroundColor: colors,
          borderWidth:     0,
          hoverOffset:     6,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: true,
        cutout:              '65%',
        animation: {
          animateRotate: true,
          duration:      600,
        },
        plugins: {
          legend: {
            position:  'bottom',
            labels: {
              padding:    12,
              usePointStyle: true,
              pointStyle: 'circle',
              font:  { size: 11, family: 'system-ui, sans-serif' },
              color: '#64748B',
              generateLabels(chart) {
                const ds    = chart.data.datasets[0];
                const total = ds.data.reduce((a, b) => a + b, 0);
                return chart.data.labels.map((label, i) => {
                  const pct = total > 0 ? ((ds.data[i] / total) * 100).toFixed(1) : 0;
                  const fmt = new Intl.NumberFormat('id-ID', {
                    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
                  });
                  return {
                    text:        `${label}  ${pct}%  ${fmt.format(ds.data[i])}`,
                    fillStyle:   ds.backgroundColor[i],
                    strokeStyle: ds.backgroundColor[i],
                    index:       i,
                    hidden:      false,
                  };
                });
              },
            },
          },
          tooltip: {
            callbacks: {
              label(ctx) {
                const ds    = ctx.chart.data.datasets[0];
                const total = ds.data.reduce((a, b) => a + b, 0);
                const pct   = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                const fmt   = new Intl.NumberFormat('id-ID', {
                  style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
                });
                return ` ${fmt.format(ctx.raw)}  (${pct}%)`;
              },
            },
            backgroundColor: '#0F172A',
            titleFont:  { size: 12 },
            bodyFont:   { size: 12 },
            padding:    10,
            cornerRadius: 8,
          },
        },
        // Teks total di tengah donut
        elements: { arc: { borderRadius: 4 } },
      },
      plugins: [{
        id: 'centerText',
        afterDraw(chart) {
          const { ctx, chartArea: { left, right, top, bottom } } = chart;
          const cx = (left + right) / 2;
          const cy = (top + bottom) / 2;

          ctx.save();

          // Label "Total"
          ctx.font       = '500 10px system-ui, sans-serif';
          ctx.fillStyle  = '#94A3B8';
          ctx.textAlign  = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Total', cx, cy - 10);

          // Angka total
          const fmt = new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
          });
          // Sederhanakan jika terlalu panjang
          const totalFmt = total >= 1_000_000
            ? 'Rp ' + (total / 1_000_000).toFixed(1) + ' jt'
            : fmt.format(total);

          ctx.font       = 'bold 13px system-ui, sans-serif';
          ctx.fillStyle  = '#0F172A';
          ctx.fillText(totalFmt, cx, cy + 8);

          ctx.restore();
        },
      }],
    });
  },

  /** Hancurkan chart instance (dipanggil saat clear data) */
  destroy() {
    if (this._instance) {
      this._instance.destroy();
      this._instance = null;
    }
  },
};
