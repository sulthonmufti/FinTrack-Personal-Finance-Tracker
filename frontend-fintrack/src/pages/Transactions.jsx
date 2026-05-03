import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Trash2, Search } from 'lucide-react';
import TransactionTable from "../components/TransactionTable";
import ProfileHeader from '../components/ProfileHeader';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');

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

  // Filter data berdasarkan pilihan kategori
  const filteredData = transactions.filter(item => 
    filterCategory === 'All' ? true : item.category === filterCategory
  );

  return (
    <>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">All Transactions</h1>
          <p className="text-slate-500">Manage and filter your full history</p>
        </div>
        <ProfileHeader />
      </header>

      {/* Tabel Lengkap dengan Filter AKTIF */}
      <TransactionTable 
        transactions={filteredData}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        hideFilter={false} // Filter Muncul di Sini!
      />
    </>
  );
}