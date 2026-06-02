import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FileText, Calendar, Wallet, TrendingUp, ArrowUpRight, 
  ArrowDownRight, Award, CheckCircle2, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import ProfileHeader from '../components/ProfileHeader';

// Update palet warna chart: Mengganti hijau dengan variasi biru FinTrack (#3b82f6)
const COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function Reports({ setIsSidebarOpen }) {
  // Ambil tanggal 30 hari yang lalu & tanggal hari ini untuk default filter
  const getPastDateString = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // State Filter
  const [startDate, setStartDate] = useState(getPastDateString(30));
  const [endDate, setEndDate] = useState(getPastDateString(0));
  const [walletId, setWalletId] = useState('All');
  const [wallets, setWallets] = useState([]);

  // State Interaktif untuk Chart Komposisi (Expense / Income)
  const [activePieTab, setActivePieTab] = useState('expense');

  // State Data Report
  const [reportData, setReportData] = useState({
    summary: { total_income: 0, total_expense: 0 },
    categories: [],
    trends: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load Daftar Dompet untuk Dropdown Filter
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/wallets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWallets(res.data.rows || res.data || []);
      } catch (err) {
        console.error("Gagal memuat dompet:", err);
      }
    };
    fetchWallets();
  }, []);

  // Fetch Data Analisis Laporan Utama
  const fetchReportDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate, walletId }
      });
      setReportData(res.data);
    } catch (err) {
      console.error("Gagal sinkronisasi data laporan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [startDate, endDate, walletId]);

  const { summary, categories, trends } = reportData;

  // --- SANITASI DATA MUTLAK (Mengubah nilai negatif menjadi positif untuk keperluan UI/Chart) ---
  const totalIncome = Math.abs(summary?.total_income || 0);
  const totalExpense = Math.abs(summary?.total_expense || 0);
  
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // Sanitasi nilai kategori agar selalu positif saat kalkulasi grafik
  const sanitizedCategories = (categories || []).map(cat => ({
    ...cat,
    value: Math.abs(cat.value || 0)
  }));

  // Sanitasi nilai tren untuk grafik batang
  const sanitizedTrends = (trends || []).map(t => ({
    ...t,
    income: Math.abs(t.income || 0),
    expense: Math.abs(t.expense || 0)
  }));

  const expenseCategories = sanitizedCategories.filter(cat => cat.type === 'expense');
  const incomeCategories = sanitizedCategories.filter(cat => cat.type === 'income');

  const currentPieData = activePieTab === 'expense' ? expenseCategories : incomeCategories;
  const currentTotalValue = activePieTab === 'expense' ? totalExpense : totalIncome;

  // Urutkan pengeluaran dari yang terbesar secara akurat setelah dikonversi ke nilai mutlak
  const topExpenseCat = expenseCategories.length > 0 
    ? [...expenseCategories].sort((a, b) => b.value - a.value)[0] 
    : null;

  const totalDays = Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))) + 1;
  const avgDailyExpense = totalExpense / totalDays;

  return (
    <>
      {/* HEADER UTAMA */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl lg:hidden text-slate-600">
            <HiOutlineMenuAlt2 size={24} />
          </button>
          <div className="flex items-center gap-2 text-slate-800">
            <FileText size={24} className="text-indigo-600" />
            <h1 className="text-2xl font-bold tracking-tight">Financial Report</h1>
          </div>
        </div>
        <div className="border-l border-slate-200 pl-2">
          <ProfileHeader />
        </div>
      </header>

      {/* FILTER PANEL STICKY BAR */}
      <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between mb-8">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            <Calendar size={16} className="text-slate-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-xs font-bold text-slate-600 outline-none" />
            <span className="text-slate-400 text-xs">to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-xs font-bold text-slate-600 outline-none" />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            <Wallet size={16} className="text-slate-400" />
            <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer">
              <option value="All">All Wallets</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={fetchReportDetails} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-bold transition-all">
          Refresh Data
        </button>
      </section>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400 italic">Mengalkulasi laporan keuangan...</div>
      ) : (
        <>
          {/* CARDS METRIK ANALISIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Total Income */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[125px] w-full">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 truncate">Total Income</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0"><ArrowUpRight size={16} /></div>
              </div>
              <div className="w-full">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </h3>
              </div>
            </div>

            {/* Total Expense */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[125px] w-full">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 truncate">Total Expense</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0"><ArrowDownRight size={16} /></div>
              </div>
              <div className="w-full">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </h3>
              </div>
            </div>

            {/* Net Savings */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[125px] w-full">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 truncate">Net Savings</span>
                <div className={`p-2 rounded-xl shrink-0 ${netSavings >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="w-full">
                <h3 className={`text-lg font-bold tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis ${netSavings >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                  Rp {netSavings.toLocaleString('id-ID')}
                </h3>
              </div>
            </div>

            {/* Savings Rate */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[125px] w-full">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 truncate">Savings Rate</span>
                <div className={`p-2 rounded-xl shrink-0 ${netSavings >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                  <Award size={16} />
                </div>
              </div>
              <div className="w-full">
                <h3 className={`text-lg font-bold tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis ${netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {savingsRate}% <span className="text-[10px] font-normal text-slate-400">({netSavings >= 0 ? 'Surplus' : 'Defisit'})</span>
                </h3>
              </div>
            </div>
          </div>

          {/* GRAPHICS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Tren Perbandingan Kolom Batang */}
            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={18} className="text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">Income vs Expense Trend</h2>
              </div>
              <div className="h-[300px] w-full">
                {sanitizedTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sanitizedTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="income" name="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs opacity-50 italic">No transaction data within this date range.</div>
                )}
              </div>
            </div>

            {/* Breakdown Struktur Proporsi Keuangan */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-800">Financial Structure</h2>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setActivePieTab('expense')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${activePieTab === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                  >
                    Expense
                  </button>
                  <button 
                    onClick={() => setActivePieTab('income')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${activePieTab === 'income' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div className="h-[200px] w-full relative flex items-center justify-center">
                {currentPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={currentPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                        {currentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs opacity-50 italic text-center">No segments detected.</div>
                )}
              </div>

              {/* Legend List */}
              <div className="mt-4 space-y-2 flex-1 overflow-y-auto max-h-[120px] pr-2">
                {currentPieData.map((entry, index) => {
                  const percentage = currentTotalValue > 0 ? ((entry.value / currentTotalValue) * 100).toFixed(1) : 0;
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="font-medium text-slate-500">{entry.name}</span>
                      </div>
                      <span>{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DETAIL ALOKASI DANA & SMART INSIGHTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Diagram Linear Alokasi Kategori Lengkap */}
            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-6">Detailed Category Breakdown</h2>
              <div className="space-y-5">
                {sanitizedCategories.length > 0 ? (
                  sanitizedCategories.map((cat, idx) => {
                    const baseTotal = cat.type === 'expense' ? totalExpense : totalIncome;
                    const pct = baseTotal > 0 ? ((cat.value / baseTotal) * 100).toFixed(1) : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${cat.type === 'expense' ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                            <span className="text-slate-700">{cat.name}</span>
                            <span className={`text-[9px] font-normal px-1.5 py-0.5 rounded-md ${cat.type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'}`}>
                              {cat.type}
                            </span>
                          </div>
                          <span className="text-slate-600">
                            Rp {cat.value.toLocaleString('id-ID')} <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${cat.type === 'expense' ? 'bg-rose-500' : 'bg-blue-500'}`} 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 italic">Belum ada rincian alokasi kategori.</div>
                )}
              </div>
            </div>

            {/* Smart Financial Insights */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">Smart Insights</h2>
              </div>

              <div className="space-y-4 flex-1">
                {netSavings < 0 ? (
                  <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl flex gap-3">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-rose-700 leading-relaxed font-medium">
                      <strong>Defisit Terdeteksi:</strong> Pengeluaran Anda melebihi pendapatan sebesar Rp {Math.abs(netSavings).toLocaleString('id-ID')}. Segera evaluasi pengeluaran non-esensial Anda.
                    </p>
                  </div>
                ) : savingsRate < 20 ? (
                  <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl flex gap-3">
                    <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">
                      <strong>Tabungan Minim:</strong> Rasio menabung Anda ({savingsRate}%) masih di bawah target ideal 20%. Cobalah untuk mulai mengalokasikan dana tabungan di awal bulan.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex gap-3">
                    <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">
                      <strong>Kondisi Prima:</strong> Luar biasa! Rasio menabung Anda mencapai {savingsRate}%. Surplus ini sangat baik jika dialokasikan ke dalam instrumen investasi atau dana darurat.
                    </p>
                  </div>
                )}

                {/* Insight Pengeluaran Tertinggi */}
                {topExpenseCat && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Pusat pengeluaran terbesar Anda berada pada kategori <strong className="text-slate-800">"{topExpenseCat.name}"</strong> dengan akumulasi total dana sebesar <strong>Rp {topExpenseCat.value.toLocaleString('id-ID')}</strong>.
                    </p>
                  </div>
                )}

                {/* Insight Rata-Rata Pengeluaran Harian */}
                {totalExpense > 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Selama periode rentang waktu <strong className="text-slate-800">{totalDays} hari</strong> ini, rata-rata dana yang Anda belanjakan adalah sebesar <strong>Rp {Math.round(avgDailyExpense).toLocaleString('id-ID')} per hari</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}