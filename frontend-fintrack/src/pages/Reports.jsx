import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Calendar, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import ProfileHeader from '../components/ProfileHeader';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

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
  const netSavings = summary.total_income - summary.total_expense;
  const savingsRate = summary.total_income > 0 ? ((netSavings / summary.total_income) * 100).toFixed(1) : 0;

  // Filter kategori khusus pengeluaran untuk Donut Chart
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <>
      {/* HEADER UTAMA (Sesuai Struktur Dashboard.jsx Anda) */}
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
          {/* CARDS METRIK ANALISIS (INSIGHTS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><ArrowUpRight size={24} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Total Period Income</p>
                <h3 className="text-lg font-bold text-slate-800">Rp {summary.total_income.toLocaleString('id-ID')}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><ArrowDownRight size={24} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Total Period Expense</p>
                <h3 className="text-lg font-bold text-slate-800">Rp {summary.total_expense.toLocaleString('id-ID')}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Award size={24} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Savings Rate</p>
                <h3 className={`text-lg font-bold ${netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {savingsRate}% <span className="text-xs font-normal text-slate-400">({netSavings >= 0 ? 'Surplus' : 'Defisit'})</span>
                </h3>
              </div>
            </div>
          </div>

          {/* AREA CHART & DONUT CHART GRAPHICS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Tren Perbandingan Kolom Batang */}
            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={18} className="text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">Income vs Expense Trend</h2>
              </div>
              <div className="h-[300px] w-full">
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs opacity-50 italic">No transaction data within this date range.</div>
                )}
              </div>
            </div>

            {/* Breakdown Pengeluaran Per Kategori */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <h2 className="text-base font-bold text-slate-800 mb-6">Expense Structure</h2>
              <div className="h-[200px] w-full relative flex items-center justify-center">
                {expenseCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs opacity-50 italic text-center">No expense categories detected.</div>
                )}
              </div>

              {/* Legend List */}
              <div className="mt-4 space-y-2 flex-1 overflow-y-auto max-h-[120px] pr-2">
                {expenseCategories.map((entry, index) => {
                  const percentage = ((entry.value / summary.total_expense) * 100).toFixed(1);
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
        </>
      )}
    </>
  );
}