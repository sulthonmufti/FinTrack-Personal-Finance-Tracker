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

  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  // Definisikan daftar bulan secara statis
  const months = [
    { val: '01', name: 'Januari' }, { val: '02', name: 'Februari' }, { val: '03', name: 'Maret' },
    { val: '04', name: 'April' }, { val: '05', name: 'Mei' }, { val: '06', name: 'Juni' },
    { val: '07', name: 'Juli' }, { val: '08', name: 'Agustus' }, { val: '09', name: 'September' },
    { val: '10', name: 'Oktober' }, { val: '11', name: 'November' }, { val: '12', name: 'Desember' }
  ];

  // Logika untuk mendapatkan daftar Tahun yang unik dari data transaksi
  const dynamicYears = transactions.length > 0 
    ? [...new Set(transactions.map(item => {
        const d = new Date(item.transaction_date);
        return isNaN(d.getTime()) ? null : d.getFullYear().toString();
      }))]
      .filter(year => year !== null)
      .sort((a, b) => b - a)
    : [];

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

  const filteredData = transactions.filter(item => {
    const date = new Date(item.transaction_date);
    if (isNaN(date.getTime())) return false;

    const itemMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const itemYear = date.getFullYear().toString();

    const matchesCategory = filterCategory === 'All' ? true : item.category === filterCategory;
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === 'All' ? true : itemMonth === filterMonth;
    const matchesYear = filterYear === 'All' ? true : itemYear === filterYear;

    return matchesCategory && matchesSearch && matchesMonth && matchesYear;
  }).sort((a, b) => b.id - a.id);

  // 2. Baru kemudian hitung Pagination menggunakan filteredData yang sudah ada
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page ke 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterMonth, filterYear]);
  //otomatis scroll ke atas tabel saat pindah halaman
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // 3. Potong data untuk ditampilkan di tabel
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // State Edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleEditClick = (transaction) => {
    setIsEditMode(true);
    setEditingId(transaction.id);
    setDescription(transaction.description);
    setAmount(Math.abs(transaction.amount)); // Simpan sebagai angka positif di input
    setCategoryId(transaction.category_id); // Gunakan ID kategori dari database
    setIsAddModalOpen(true);
  };
  
  //fungsi untuk menambahkan dan mengedit transaksi
  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');

    // Temukan kategori yang dipilih untuk mengecek tipenya
    const selectedCategory = categories.find(cat => cat.id === Number(categoryId));
    const isExpense = selectedCategory?.type === 'expense';

    // Pastikan amount bernilai negatif jika tipenya expense, dan positif jika income
    const numericAmount = parseFloat(amount);
    const finalAmount = isExpense ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    
    const payload = { 
      description, 
      amount: finalAmount, 
      category_id: categoryId
    };

    try {
      if (isEditMode) {
        // MODE EDIT
        await axios.put(`http://localhost:5000/api/transactions/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // MODE TAMBAH
        await axios.post('http://localhost:5000/api/transactions', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchData(); // Refresh tabel
      closeModal(); // Tutup dan reset
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert("Gagal menyimpan transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setDescription('');
    setAmount('');
    setCategoryId(categories.length > 0 ? categories[0].id : 1); 
};

  return (
    <>
      {/* header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4">
            {/* Tombol Menu */}
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

          {/* ProfileHeader untuk Mobile */}
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

          {/* ProfileHeader untuk Desktop */}
          <div className="hidden md:block pl-4 border-l border-slate-200 ml-2">
            <ProfileHeader />
          </div>
        </div>
      </header>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 lg:flex gap-3 lg:w-auto">
          <select 
            className="w-full lg:w-40 bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-3.5 rounded-2xl outline-none cursor-pointer shadow-sm appearance-none"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="All">All Months</option>
            {months.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
          </select>

          <select 
            className="w-full lg:w-32 bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-3.5 rounded-2xl outline-none cursor-pointer shadow-sm appearance-none"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="All">All Years</option>
            {dynamicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABEL */}
      <TransactionTable 
        transactions={currentItems}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        hideFilter={false}
        onDelete={(item) => { setSelectedTransaction(item); setIsDeleteModalOpen(true); }}
        onEdit={handleEditClick}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={filteredData.length}
      />

      {/* MODALS */}
      <TransactionModal 
        isOpen={isAddModalOpen}
        onClose={closeModal} // Gunakan fungsi closeModal yang baru
        categories={categories}
        onSubmit={handleFormSubmit} // Gunakan fungsi handleFormSubmit yang baru
        isLoading={isLoading}
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        title={isEditMode ? "Edit Transaction" : "Add Transaction"} // Judul dinamis
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