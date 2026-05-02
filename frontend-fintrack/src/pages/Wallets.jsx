import { useEffect, useState } from 'react'
import axios from 'axios'
import TransactionModal from "../components/TransactionModal";
import StatsGrid from "../components/StatsGrid";
import TransactionTable from "../components/TransactionTable";
import { LayoutDashboard, Plus, RefreshCw } from 'lucide-react'
import ProfileHeader from '../components/ProfileHeader';

// Terima props setIsSidebarOpen dari App.jsx
export default function Wallets({ setIsSidebarOpen }) {
  const [transactions, setTransactions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [filterCategory, setFilterCategory] = useState('All')
  
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const fetchTransactions = () => {
    const token = localStorage.getItem('token'); // Ambil token

    axios.get('http://localhost:5000/api/transactions', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err));
  };

  const fetchCategories = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/transactions/categories', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => setCategories(res.data))
      .catch(err => console.error("Gagal ambil kategori:", err));
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleAddTransaction = (e) => {
  e.preventDefault();
  if (!description || !amount) return alert("Isi semua data dulu ya!");
  setIsLoading(true);

  // Ambil tipe kategori untuk menentukan +/- saldo
  const selectedCategory = categories.find(cat => cat.id === parseInt(categoryId));
  const categoryType = selectedCategory ? selectedCategory.type : 'income';
  
  let finalAmount = Math.abs(Number(amount));
  if (categoryType === 'expense') finalAmount = -finalAmount;

  const token = localStorage.getItem('token');

  axios.post('http://localhost:5000/api/transactions', {
    description,
    amount: finalAmount,
    category_id: parseInt(categoryId) // Pastikan dikirim sebagai angka
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(() => {
    //refresh data setelah berhasil
    fetchTransactions(); 
    
    // reset form
    setDescription('');   
    setAmount('');
    setCategoryId(categories[0]?.id || 1); // Reset ke kategori pertama
    setIsModalOpen(false);
  })
  .catch(err => alert("Gagal: " + err.message))
  .finally(() => setIsLoading(false));
};

  // LOGIKA PERHITUNGAN
  const totalBalance = transactions.reduce((acc, curr) => {
    const amt = Number(curr.amount) || 0;
    // return curr.type === 'expense' ? acc - Math.abs(amt) : acc + Math.abs(amt);
    return acc + Number(curr.amount);
  }, 0);

  const chartData = transactions.length > 0 ? transactions.slice(-9).map(t => {
    const amounts = transactions.map(tr => Number(tr.amount));
    return (Math.abs(Number(t.amount)) / Math.max(...amounts, 1)) * 100;
  }) : [];

  const filteredTransactions = transactions.filter(item => 
    filterCategory === 'All' ? true : item.category === filterCategory
  );

  const pieData = categories.map(cat => {
    const total = transactions
      .filter(t => t.category === cat.name)
      .reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
    return { name: cat.name, value: total };
  }).filter(data => data.value > 0);

  return (
    <>
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* AREA KIRI: Menu Mobile + Judul */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 shadow-sm"
          >
            <LayoutDashboard size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Wallets</h1>
            <p className="text-slate-500 text-xs md:text-sm">Manage your finances</p>
          </div>
        </div>

        {/* AREA KANAN: Refresh + Add Button + Profile */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <button 
            onClick={fetchTransactions} 
            className="p-3.5 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-colors text-slate-600 hidden md:block cursor-pointer"
          >
            <RefreshCw size={18} />
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline cursor-pointer">Add Transaction</span>
          </button>

          {/* Profile Header dimasukkan di sini agar sejajar dengan Judul & Button */}
          <div className="pl-2 border-l border-slate-200 ml-2 hidden sm:block">
            <ProfileHeader />
          </div>
        </div>
      </header>

      {/* Komponen hasil Extraction */}
      <StatsGrid 
        totalBalance={totalBalance} 
        pieData={pieData} 
        chartData={chartData} 
        COLORS={COLORS} 
      />

      <TransactionTable 
        transactions={filteredTransactions}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
      />

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
  )
}