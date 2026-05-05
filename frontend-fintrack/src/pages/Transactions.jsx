import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Trash2, Search } from 'lucide-react';
import TransactionTable from "../components/TransactionTable";
import ProfileHeader from '../components/ProfileHeader';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState(""); //state search

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

  // Function untuk delete
  const handleDelete = async (id) => {
    // Konfirmasi Pop-up
    const confirmed = window.confirm("Apakah kamu yakin ingin menghapus transaksi ini?");
    
    if (confirmed) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refresh data setelah berhasil dihapus
        fetchData(); 
      } catch (err) {
        alert("Gagal menghapus data: " + err.message);
      }
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
        onDelete={handleDelete} 
      />
    </>
  );
}