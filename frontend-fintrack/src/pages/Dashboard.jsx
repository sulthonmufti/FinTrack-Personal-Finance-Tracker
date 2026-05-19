import { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, Plus, ArrowRight } from 'lucide-react';
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { Link } from 'react-router-dom';
import TransactionModal from "../components/TransactionModal";
import StatsGrid from "../components/StatsGrid";
import TransactionTable from "../components/TransactionTable";
import ProfileHeader from '../components/ProfileHeader'; // 1. Tetap import ProfileHeader

export default function Dashboard({ setIsSidebarOpen }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk Form Modal
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [transactionDate, setTransactionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // ==========================================
  // State untuk Filter Global Dashboard (Default: 'All')
  // ==========================================
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  const months = [
    { val: 'All', name: 'All Months' }, // 2. Kembalikan pilihan All Months
    { val: '01', name: 'Januari' }, { val: '02', name: 'Februari' },
    { val: '03', name: 'Maret' }, { val: '04', name: 'April' },
    { val: '05', name: 'Mei' }, { val: '06', name: 'Juni' },
    { val: '07', name: 'Juli' }, { val: '08', name: 'Agustus' },
    { val: '09', name: 'September' }, { val: '10', name: 'Oktober' },
    { val: '11', name: 'November' }, { val: '12', name: 'Desember' }
  ];

  const years = ['All', '2024', '2025', '2026', '2027', '2028']; // Tambahkan 'All' untuk tahun
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const [resTrans, resCats] = await Promise.all([
        axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { month: filterMonth, year: filterYear }
        }),
        axios.get('http://localhost:5000/api/transactions/categories', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setTransactions(resTrans.data);
      setCategories(resCats.data);
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [filterMonth, filterYear]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const selectedCategory = categories.find(cat => cat.id === Number(categoryId));
      const isExpense = selectedCategory?.type === 'expense';
      const numericAmount = parseFloat(amount);
      const finalAmount = isExpense ? -Math.abs(numericAmount) : Math.abs(numericAmount);

      await axios.post('http://localhost:5000/api/transactions', {
        description,
        amount: finalAmount,
        category_id: categoryId,
        transaction_date: transactionDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDescription('');
      setAmount('');
      const today = new Date();
      setTransactionDate(today.toISOString().split('T')[0]);
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  // Logika Kalkulasi Data Keuangan
  const totalBalance = transactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const expenseTransactions = transactions.filter(t => parseFloat(t.amount) < 0);
  const categoryTotals = expenseTransactions.reduce((acc, curr) => {
    const catName = curr.category || 'Uncategorized';
    acc[catName] = (acc[catName] || 0) + Math.abs(parseFloat(curr.amount));
    return acc;
  }, {});

  const pieData = Object.keys(categoryTotals).map(key => ({
    name: key,
    value: categoryTotals[key]
  }));

  // Membalikkan urutan (.reverse()) agar transaksi terlama di kiri dan terbaru di kanan grafik
  const chartData = transactions
    .slice(0, 7)
    .map(t => ({
      name: t.description.substring(0, 10), // Ambil 10 karakter pertama deskripsi sebagai label
      amount: parseFloat(t.amount)          // Nominal asli (bisa positif/negatif)
    }))
    .reverse();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <HiOutlineMenuAlt2 size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-400 text-xs font-medium">Overview of your financial health</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* UI Dropdown Filter Global */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent border-none text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer focus:ring-0"
              >
                {months.map(m => (
                  <option key={m.val} value={m.val}>{m.name}</option>
                ))}
              </select>
              
              <div className="w-[1px] bg-slate-200 my-1 mx-1"></div>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-transparent border-none text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer focus:ring-0"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-3 rounded-2xl transition-all shadow-md shadow-indigo-100 active:scale-[0.98]"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Add Transaction</span>
            </button>

            {/* 1. KEMBALIKAN ProfileHeader di Pojok Kanan Atas */}
            <div className="border-l border-slate-200 pl-2">
              <ProfileHeader />
            </div>
          </div>
        </div>
      </header>

      <StatsGrid 
        totalBalance={totalBalance} 
        pieData={pieData} 
        chartData={chartData} 
        COLORS={COLORS} 
      />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Recent Transactions</h2>
          <Link 
            to="/transactions" 
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-all"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <TransactionTable 
          transactions={recentTransactions}
          hideFilter={true} 
        />
      </div>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onSubmit={handleAddTransaction}
        isLoading={isLoading}
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        transactionDate={transactionDate}
        setTransactionDate={setTransactionDate}
        title="Add Transaction"
      />
    </>
  );
}