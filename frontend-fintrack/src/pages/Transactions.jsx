import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Plus, Menu } from 'lucide-react'; 
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
  });

  return (
    <>
      {/* HEADER DISAMAKAN DENGAN DASHBOARD */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 shadow-sm active:scale-95 transition-all"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">All Transactions</h1>
            <p className="text-slate-500 text-sm">Manage your full financial history</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>

          <div className="pl-2 border-l border-slate-200 ml-2 hidden sm:block">
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