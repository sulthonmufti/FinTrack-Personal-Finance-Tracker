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

const NavItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
)

function App() {
  const [transactions, setTransactions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false) // State untuk buka/tutup modal

  // State untuk form input
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(1);

  const fetchTransactions = () => {
    axios.get('http://localhost:5000/api/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount) return alert("Isi semua data dulu ya!");

    axios.post('http://localhost:5000/api/transactions', {
      description,
      amount: parseInt(amount),
      category_id: categoryId
    }).then(() => {
      fetchTransactions();
      setDescription('');
      setAmount('');
      setIsModalOpen(false); // Tutup modal setelah sukses
    }).catch(err => alert("Gagal simpan data: " + err.message));
  };

  // Menghitung total saldo secara dinamis
  const totalBalance = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Menghitung persentase sederhana (opsional, untuk tampilan)
  const percentageIncrease = 12.5;

  // Mengambil 9 transaksi terakhir untuk grafik
  const chartData = transactions.slice(-9).map(t => {
    // Kita normalisasi tingginya agar maksimal 100%
    const maxAmount = Math.max(...transactions.map(tr => tr.amount), 1);
    return (t.amount / maxAmount) * 100;
  });

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
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="0"
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Save Transaction
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
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold tracking-widest mb-2 uppercase">Total Balance</p>
            {/* Angka Saldo Dinamis */}
            <h2 className="text-3xl font-bold">
              Rp {totalBalance.toLocaleString('id-ID')}
            </h2>
            <p className="text-emerald-500 text-xs mt-3 font-bold bg-emerald-50 inline-block px-2 py-1 rounded-lg">
              ↑ {percentageIncrease}%
            </p>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 col-span-2 text-white relative overflow-hidden">
            <p className="opacity-70 text-xs font-bold tracking-widest uppercase">Recent Activity</p>
            <div className="h-20 flex items-end gap-3 mt-6">
                {/* Grafik Dinamis berdasarkan data transaksi */}
                {chartData.length > 0 ? chartData.map((h, i) => (
                  <div 
                    key={i} 
                    style={{ height: `${Math.max(h, 10)}%` }} // Minimal tinggi 10% agar tetap terlihat
                    className="flex-1 bg-white/20 rounded-full transition-all duration-500"
                  ></div>
                )) : (
                  <p className="text-white/40 text-xs">Belum ada data aktivitas</p>
                )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-bold">Recent Transactions</h3>
            <button className="text-indigo-600 font-bold text-sm">View All</button>
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
              {transactions.map(item => (
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
        </section>
      </main>
    </div>
  )
}

export default App