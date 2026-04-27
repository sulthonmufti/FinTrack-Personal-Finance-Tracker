import { useEffect, useState } from 'react'
import axios from 'axios'
import TransactionModal from "../components/TransactionModal";
import StatsGrid from "../components/StatsGrid";
import TransactionTable from "../components/TransactionTable";
import { LayoutDashboard, Plus, RefreshCw } from 'lucide-react'

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
    axios.get('http://localhost:5000/api/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err));
  };

  const fetchCategories = () => {
    axios.get('http://localhost:5000/api/categories')
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

    const selectedCategory = categories.find(cat => cat.id === parseInt(categoryId));
    const categoryType = selectedCategory ? selectedCategory.type : 'income';
    let finalAmount = Math.abs(Number(amount));
    if (categoryType === 'expense') finalAmount = -finalAmount;

    axios.post('http://localhost:5000/api/transactions', {
      description,
      amount: finalAmount,
      category_id: categoryId
    }).then(() => {
      fetchTransactions(); 
      setDescription('');   
      setAmount('');
      setIsModalOpen(false);
      alert("Data berhasil disimpan!");
    }).catch(err => {
      alert("Gagal simpan data: " + err.message);
    }).finally(() => setIsLoading(false));
  };

  // LOGIKA PERHITUNGAN
  const totalBalance = transactions.reduce((acc, curr) => {
    const amt = Number(curr.amount) || 0;
    return curr.type === 'expense' ? acc - Math.abs(amt) : acc + Math.abs(amt);
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
      <header className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Gunakan props untuk buka sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 shadow-sm"
          >
            <LayoutDashboard size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Wallets</h1>
            <p className="text-slate-500 text-xs md:text-sm">Manage your finances</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button onClick={fetchTransactions} className="p-4 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50">
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 lg:py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg"
          >
            <Plus size={20} />
            <span>Add Transaction</span>
          </button>
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