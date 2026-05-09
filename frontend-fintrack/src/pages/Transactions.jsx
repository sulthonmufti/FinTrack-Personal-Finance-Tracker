import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Plus, Menu } from 'lucide-react'; 
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import TransactionTable from "../components/TransactionTable";
import ProfileHeader from '../components/ProfileHeader';
import TransactionModal from "../components/TransactionModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function Transactions({ setIsSidebarOpen }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState("");
  
  // State Modal Tambah
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(1);

  // State Modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchData = async () => {
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
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/transactions', 
        { description, amount: Number(amount), category_id: categoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      setIsAddModalOpen(false);
      setDescription('');
      setAmount('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = transactions.filter(item => {
    const matchesCategory = filterCategory === 'All' ? true : item.category === filterCategory;
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  })
  //sorting berdasarkan ID terbesar (terbaru) ke terkecil
  .sort((a, b) => b.id - a.id);
  

  return (
    <>
      {/* header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4">
            {/* Tombol Menu Modern */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl text-slate-600 active:scale-90 transition-all shadow-sm"
            >
              <HiOutlineMenuAlt2 size={24} />
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Transactions</h1>
              <p className="text-slate-500 text-xs hidden md:block">Manage your history</p>
            </div>
          </div>

          {/* ProfileHeader untuk Mobile (Pindah ke samping judul) */}
          <div className="md:hidden">
            <ProfileHeader />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Add Transaction</span>
          </button>

          {/* ProfileHeader untuk Desktop (Muncul di kanan tombol) */}
          <div className="hidden md:block pl-4 border-l border-slate-200 ml-2">
            <ProfileHeader />
          </div>
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text"
          placeholder="Search transactions..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABEL */}
      <TransactionTable 
        transactions={filteredData}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        hideFilter={false}
        onDelete={(item) => { setSelectedTransaction(item); setIsDeleteModalOpen(true); }}
      />

      {/* MODALS */}
      <TransactionModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
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

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/transactions/${selectedTransaction.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchData();
          setIsDeleteModalOpen(false);
        }}
        description={selectedTransaction?.description}
      />
    </>
  );
}