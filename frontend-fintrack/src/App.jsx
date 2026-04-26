import { useEffect, useState } from 'react'
import axios from 'axios'
import './index.css'
// Import icon dari lucide
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  BarChart3, 
  Settings, 
  Plus, 
  X,
  RefreshCw
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const NavItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
)

// Fungsi untuk format angka menjadi Rupiah
const formatRupiah = (value) => {
  if (!value) return '';
  const numberString = value.toString().replace(/[^,\d]/g, '');
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
};

function App() {
  const [transactions, setTransactions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false) // State untuk buka/tutup modal
  const [categories, setCategories] = useState([])
  const [filterCategory, setFilterCategory] = useState('All'); // Default menampilkan semua

  // State untuk form input
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(1);

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
    fetchCategories(); // Panggil fungsi ambil kategori
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount) return alert("Isi semua data dulu ya!");

    setIsLoading(true);

    //Cari data kategori yang dipilih untuk tahu tipenya (income/expense)
    const selectedCategory = categories.find(cat => cat.id === parseInt(categoryId));
    const categoryType = selectedCategory ? selectedCategory.type : 'income';

    //Tentukan nominal: Jika expense, paksa jadi angka negatif
    let finalAmount = Math.abs(Number(amount)); // Menggunakan Number agar lebih fleksibel
    if (categoryType === 'expense') {
      finalAmount = -finalAmount; //Ubah jadi negatif
    }

    axios.post('http://localhost:5000/api/transactions', {
      description,
      amount: finalAmount, //Kirim angka yang sudah disesuaikan
      category_id: categoryId
    }).then(() => {
      fetchTransactions(); 
      setDescription('');   
      setAmount('');
      setIsModalOpen(false);
      alert("Data berhasil disimpan!");
    }).catch(err => {
      alert("Gagal simpan data: " + err.message);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  //Hitung total saldo secara dinamis
  const totalBalance = transactions.reduce((acc, curr) => {
    const amount = Number(curr.amount) || 0;
    if (curr.type === 'income') {
      return acc + amount;
    } else if (curr.type === 'expense') {
      return acc - amount;
    }
    return acc;
  }, 0);

  //Hitung persentase sederhana (opsional, untuk tampilan)
  const percentageIncrease = 12.5;

  //Ambil 9 transaksi terakhir untuk grafik
  const chartData = transactions.length > 0 ? transactions.slice(-9).map(t => {
    const amounts = transactions.map(tr => Number(tr.amount));
    const maxAmount = Math.max(...amounts, 1);
    return (Number(t.amount) / maxAmount) * 100;
  }) : [];

  // Filter data berdasarkan kategori yang dipilih
  const filteredTransactions = transactions.filter(item => {
    if (filterCategory === 'All') return true;
    return item.category === filterCategory;
  });

  // Logika untuk menyiapkan data Pie Chart
  const pieData = categories.map(cat => {
    // Hitung total nominal untuk tiap kategori
    const total = transactions
      .filter(t => t.category === cat.name)
      .reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);

    return { name: cat.name, value: total };
  }).filter(data => data.value > 0); // Hanya tampilkan kategori yang ada transaksinya

  // Warna untuk tiap slice di Pie Chart
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories && categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Description</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="What's this for?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Amount (Rp)</label>
                <input 
                  type="text"  // Ubah dari "number" ke "text"
                  value={formatRupiah(amount)} // Tampilan otomatis berformat titik
                  onChange={(e) => {
                    // Hanya simpan angka murni ke dalam state
                    const rawValue = e.target.value.replace(/\./g, '');
                    if (!isNaN(rawValue)) {
                      setAmount(rawValue);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  placeholder="0"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading} //Mencegah klik ganda
                className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all ${
                  isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-200 p-6 flex flex-col gap-8 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic">F</div>
          <span className="text-xl font-bold tracking-tight">FinTrack</span>
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" />
          <NavItem icon={Wallet} label="Wallets" active={true} />
          <NavItem icon={ArrowLeftRight} label="Transactions" />
          <NavItem icon={BarChart3} label="Reports" />
          <NavItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Wallets</h1>
            <p className="text-slate-500 text-sm">Manage your finances across all accounts</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchTransactions} className="p-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50">
              <RefreshCw size={18} className="text-slate-600" />
            </button>
            {/* tombol */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          
          {/* Kartu Saldo (tetap 1 kolom) */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-slate-400 text-xs font-bold tracking-widest mb-2 uppercase">Total Balance</p>
            <h2 className="text-2xl font-bold text-indigo-600">
              Rp {totalBalance.toLocaleString('id-ID')}
            </h2>
          </div>

          {/* KARTU PIE CHART (2 kolom) */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm col-span-2 flex items-center">
            <div className="w-1/2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Expenses by Category</h3>
              {pieData.slice(0, 4).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs font-medium text-slate-500 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kartu Recent Activity (1 kolom, sesuaikan lebarnya) */}
          <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden">
            <p className="opacity-70 text-[10px] font-bold tracking-widest uppercase">Trend</p>
            <div className="h-16 flex items-end gap-2 mt-4">
              {chartData.map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-white/20 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter:</span>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600">
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
              <tr>
                <th className="px-10 py-5">Description</th>
                <th className="px-10 py-5 text-center">Category</th>
                <th className="px-10 py-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* {transactions.map(item => ( */}
              {filteredTransactions.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6 text-sm font-semibold text-slate-700">{item.description}</td>
                  <td className="px-10 py-6 text-center">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right text-sm font-bold text-slate-900">
                    Rp {Number(item.amount).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-20 text-center text-slate-400">
              <p className="text-sm font-medium">No transactions found in this category.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App