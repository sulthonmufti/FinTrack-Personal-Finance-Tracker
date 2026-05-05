import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Trash2, Search } from 'lucide-react';
import TransactionTable from "../components/TransactionTable";
import ProfileHeader from '../components/ProfileHeader';
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState(""); //state search
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

  // Filter data berdasarkan pilihan kategori & search
  const filteredData = transactions.filter(item => {
    const matchesCategory = filterCategory === 'All' ? true : item.category === filterCategory;
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  //buka Modal (panggil waktu klik icon sampah)
  const openDeleteModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  //eksekusi delete (panggil waktu klik "Delete" di dalam Modal)
  const confirmDelete = async () => {
    if (!selectedTransaction) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${selectedTransaction.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh data tabel
      setIsDeleteModalOpen(false); // Tutup modal
      setSelectedTransaction(null); // Reset data terpilih
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">All Transactions</h1>
          <p className="text-slate-500">Manage and filter your full history</p>
        </div>
        <ProfileHeader />
      </header>

      {/* search bar */}
      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text"
          placeholder="Search by description..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabel Lengkap dengan Filter AKTIF */}
      <TransactionTable 
        transactions={filteredData}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        hideFilter={false}
        onDelete={openDeleteModal}
      />
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        description={selectedTransaction?.description}
      />
    </>
  );
}