import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Search, Plus, CheckCircle2 } from 'lucide-react'; 
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import TransactionTable from "../components/TransactionTable";
import ProfileHeader from '../components/ProfileHeader';
import TransactionModal from "../components/TransactionModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function Transactions({ setIsSidebarOpen }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterWallet, setFilterWallet] = useState('All');
  const [searchTerm, setSearchTerm] = useState("");

  // Ambil format tanggal hari ini (YYYY-MM-DD) sebagai nilai default awal
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // State Modal Tambah / Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [transactionDate, setTransactionDate] = useState(getTodayDateString());

  // State Modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // State Toast Notifikasi Sukses
  const [toastNotification, setToastNotification] = useState({
    show: false,
    title: '',
    message: ''
  });

  const showSuccessToast = (title, message) => {
    setToastNotification({ show: true, title, message });
    setTimeout(() => {
      setToastNotification({ show: false, title: '', message: '' });
    }, 3000);
  };

  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  const months = [
    { val: '01', name: 'Januari' }, { val: '02', name: 'Februari' }, { val: '03', name: 'Maret' },
    { val: '04', name: 'April' }, { val: '05', name: 'Mei' }, { val: '06', name: 'Juni' },
    { val: '07', name: 'Juli' }, { val: '08', name: 'Agustus' }, { val: '09', name: 'September' },
    { val: '10', name: 'Oktober' }, { val: '11', name: 'November' }, { val: '12', name: 'Desember' }
  ];

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
        api.get('/api/transactions', { headers }),
        api.get('/api/transactions/categories', { headers })
      ]);
      setTransactions(resTrans.data);
      setCategories(resCats.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [wallets, setWallets] = useState([]);
  const [walletId, setWalletId] = useState('');

  const fetchWallets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallets(res.data);
    } catch (err) {
      console.error("Gagal mengambil data dompet untuk modal:", err);
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchWallets();
  }, []);

  const filteredData = transactions.filter(item => {
    const date = new Date(item.transaction_date);
    if (isNaN(date.getTime())) return false;

    const itemMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const itemYear = date.getFullYear().toString();

    const matchesCategory = filterCategory === 'All' ? true : item.category === filterCategory;
    const walletName = item.wallet_name || item.wallet || 'Main Wallet';
    const matchesWallet = filterWallet === 'All' ? true : walletName === filterWallet;
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === 'All' ? true : itemMonth === filterMonth;
    const matchesYear = filterYear === 'All' ? true : itemYear === filterYear;

    return matchesCategory && matchesWallet && matchesSearch && matchesMonth && matchesYear;
  }).sort((a, b) => b.id - a.id);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterMonth, filterYear, filterWallet]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const [activeTab, setActiveTab] = useState('expense');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleEditClick = (transaction) => {
    setIsEditMode(true);
    setEditingId(transaction.id);
    setSelectedTransaction(transaction);
    setDescription(transaction.description);
    setAmount(Math.abs(transaction.amount)); 
    setCategoryId(transaction.category_id); 
    setWalletId(transaction.wallet_id || '');
    setActiveTab(transaction.amount < 0 ? 'expense' : 'income');

    const formattedDate = transaction.transaction_date ? transaction.transaction_date.split('T')[0] : getTodayDateString();
    setTransactionDate(formattedDate);

    setIsAddModalOpen(true);
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = {
        amount: activeTab === 'expense' ? -Math.abs(parseInt(amount)) : Math.abs(parseInt(amount)),
        description,
        category_id: parseInt(categoryId),
        wallet_id: parseInt(walletId)
      };

      if (isEditMode) {
        if (!selectedTransaction || !selectedTransaction.id) {
          throw new Error("ID Transaksi yang akan diedit tidak ditemukan.");
        }

        await api.put(
          `/api/transactions/${selectedTransaction.id}`, 
          data, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showSuccessToast("Berhasil Diperbarui", "Data transaksi telah berhasil diubah.");
      } else {
        await api.post(
          '/api/transactions', 
          data, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showSuccessToast("Berhasil Ditambahkan", "Transaksi baru telah berhasil dicatat.");
      }

      fetchData(); 
      closeModal(); 
    } catch (err) {
      console.error("Detail Error Sistem:", err.message || err);
      alert("Gagal memproses transaksi. Silakan periksa kembali data Anda.");
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
    setWalletId('');
    setTransactionDate(getTodayDateString());
    setActiveTab('expense');
  };

  return (
    <>
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4">
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

      {/* TABEL TRANSAKSI */}
      <TransactionTable 
        transactions={currentItems}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        wallets={wallets}                     
        filterWallet={filterWallet}           
        setFilterWallet={setFilterWallet}
        hideFilter={false}
        onDelete={(item) => { setSelectedTransaction(item); setIsDeleteModalOpen(true); }}
        onEdit={handleEditClick}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={filteredData.length}
      />

      {/* MODAL EDIT & TAMBAH */}
      <TransactionModal 
        isOpen={isAddModalOpen}
        onClose={closeModal}
        categories={categories}
        wallets={wallets}
        walletId={walletId}
        setWalletId={setWalletId}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        transactionDate={transactionDate}
        setTransactionDate={setTransactionDate}
        title={isEditMode ? "Edit Transaction" : "Add Transaction"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* MODAL KONFIRMASI HAPUS */}
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          try {
            const token = localStorage.getItem('token');
            await api.delete(`/api/transactions/${selectedTransaction.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            setIsDeleteModalOpen(false);
            
            // Pemicu Notifikasi Pop-up Sukses
            showSuccessToast("Berhasil Dihapus", `Transaksi "${selectedTransaction?.description || ''}" telah dihapus.`);
          } catch (err) {
            console.error("Gagal menghapus transaksi:", err);
            alert("Gagal menghapus transaksi. Silakan coba lagi.");
          }
        }}
        description={selectedTransaction?.description}
      />

      {/* POP-UP OVERLAY NOTIFIKASI SUKSES DENGAN ANIMASI */}
      {toastNotification.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-800 animate-bounce">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">{toastNotification.title}</p>
            <p className="text-xs text-slate-400">{toastNotification.message}</p>
          </div>
        </div>
      )}
    </>
  );
}