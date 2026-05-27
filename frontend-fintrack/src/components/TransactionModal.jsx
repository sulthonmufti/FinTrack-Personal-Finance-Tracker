import { useEffect, useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  categories,
  wallets = [],
  walletId,
  setWalletId,
  onSubmit, 
  isLoading,
  description,
  setDescription,
  amount,
  setAmount,
  categoryId,
  setCategoryId,
  transactionDate,
  setTransactionDate,
  title
}) {
  // State untuk melacak tab aktif ('expense' atau 'income')
  const [activeTab, setActiveTab] = useState('expense');

  // Filter kategori berdasarkan tab yang aktif
  const filteredCategories = categories.filter(cat => cat.type === activeTab);

  // Efek untuk otomatis memilih kategori pertama saat tab berpindah atau modal dibuka
  useEffect(() => {
    if (isOpen && filteredCategories.length > 0) {
      // Cek apakah categoryId yang sekarang ada di dalam daftar kategori yang sudah difilter
      const isIdValidInTab = filteredCategories.some(cat => cat.id === Number(categoryId));
      
      // Jika tidak valid (atau baru ganti tab), set ke kategori pertama dari tab aktif tersebut
      if (!isIdValidInTab) {
        setCategoryId(filteredCategories[0].id);
      }
    }
    // logic untuk otomatis memilih wallet pertama saat modal dibuka
    if (isOpen && wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [activeTab, isOpen, categories, wallets]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-100">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'expense'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'income'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Income
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* dropdown wallet */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Wallet
            </label>
            <select
              value={walletId || ''}
              onChange={(e) => setWalletId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-sm"
            >
              {wallets.length === 0 ? (
                <option value="" disabled>No wallet available. Please create one first.</option>
              ) : (
                wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Rp {parseFloat(w.balance).toLocaleString('id-ID')})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* input Deskripsi */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Description</label>
            <input 
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="e.g. Nasi Goreng, Gaji Bulanan"
              required
            />
          </div>

          {/* input Kategori */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Category</label>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-sm"
              required
              disabled={filteredCategories.length === 0}
            >
              {filteredCategories.length === 0 ? (
                <option value="">Belum ada kategori</option>
              ) : (
                filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              )}
            </select>
          </div>

          {/* input Tanggal */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Date</label>
            <div className="relative">
              <input 
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none cursor-pointer"
                required
              />
              <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* input Nominal */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Amount (Rp)</label>
            <input 
              type="text"
              value={formatRupiah(amount)}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\./g, '');
                if (!isNaN(rawValue)) {
                  setAmount(rawValue);
                }
              }}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 font-bold text-lg transition-all ${
                activeTab === 'expense' ? 'focus:ring-rose-500 text-rose-600' : 'focus:ring-emerald-500 text-emerald-600'
              }`} 
              placeholder="0"
              required
            />
          </div>

          {/* tombol Simpan */}
          <button 
            type="submit" 
            disabled={isLoading || filteredCategories.length === 0 || wallets.length === 0}
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] ${
              isLoading || filteredCategories.length === 0 || wallets.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                : activeTab === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}