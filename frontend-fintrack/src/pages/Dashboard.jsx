import { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, Plus, RefreshCw, ArrowRight } from 'lucide-react';
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { Link } from 'react-router-dom'; // Pastikan sudah install react-router-dom
import TransactionModal from "../components/TransactionModal";
import StatsGrid from "../components/StatsGrid";
import TransactionTable from "../components/TransactionTable";
import ProfileHeader from '../components/ProfileHeader';

export default function Dashboard({ setIsSidebarOpen }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk Form Modal
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(1);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resTrans, resCats] = await Promise.all([
        axios.get('http://localhost:5000/api/transactions', { headers }),
        axios.get('http://localhost:5000/api/transactions/categories', { headers })
      ]);
      setTransactions(resTrans.data);
      setCategories(resCats.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount) return alert("Isi semua data dulu ya!");
    setIsLoading(true);

    const selectedCategory = categories.find(cat => cat.id === parseInt(categoryId));
    const categoryType = selectedCategory ? selectedCategory.type : 'income';
    
    let finalAmount = Math.abs(Number(amount));
    if (categoryType === 'expense') finalAmount = -finalAmount;

    const token = localStorage.getItem('token');

    axios.post('http://localhost:5000/api/transactions', {
      description,
      amount: finalAmount,
      category_id: parseInt(categoryId)
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      fetchInitialData(); 
      setDescription('');   
      setAmount('');
      setIsModalOpen(false);
    })
    .catch(err => alert("Gagal: " + err.message))
    .finally(() => setIsLoading(false));
  };

  // --- LOGIKA RINGKASAN (Sama dengan Wallets.jsx) ---
  const totalBalance = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const chartData = transactions.length > 0 ? transactions.slice(-9).map(t => {
    const amounts = transactions.map(tr => Number(tr.amount));
    return (Math.abs(Number(t.amount)) / Math.max(...amounts, 1)) * 100;
  }) : [];

  const pieData = categories.map(cat => {
    const total = transactions
      .filter(t => t.category === cat.name)
      .reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
    return { name: cat.name, value: total };
  }).filter(data => data.value > 0);

  // HANYA TAMPILKAN 5 TRANSAKSI TERAKHIR UNTUK DASHBOARD
  const recentTransactions = transactions.slice(0, 5);

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu: Hanya muncul di Mobile/Tablet */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl text-slate-600 active:scale-90 transition-all shadow-sm"
            >
              <HiOutlineMenuAlt2 size={24} />
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-500 text-xs hidden md:block">Monitor your daily financial activity</p>
            </div>
          </div>

          {/* ProfileHeader: Di Mobile akan pindah ke pojok kanan atas sejajar judul */}
          <div className="md:hidden">
            <ProfileHeader />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tombol Add Transaction: Lebar penuh di mobile, auto di desktop */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Add Transaction</span>
          </button>

          {/* ProfileHeader: Di Desktop muncul di sini (setelah tombol) */}
          <div className="hidden md:flex items-center pl-4 border-l border-slate-200 ml-2">
            <ProfileHeader />
          </div>
        </div>
      </header>

      {/* Grid Statistik Utama */}
      <StatsGrid 
        totalBalance={totalBalance} 
        pieData={pieData} 
        chartData={chartData} 
        COLORS={COLORS} 
      />

      {/* Bagian Transaksi Terakhir */}
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
        
        {/* Menggunakan Table yang sama tapi dengan data terbatas */}
        <TransactionTable 
          transactions={recentTransactions}
          hideFilter={true} // Kita akan tambahkan prop ini nanti di TransactionTable agar lebih bersih
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
      />
    </>
  );
}