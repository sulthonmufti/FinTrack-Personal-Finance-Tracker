import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  categories, 
  onSubmit, 
  isLoading,
  description,
  setDescription,
  amount,
  setAmount,
  categoryId,
  setCategoryId,
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
  }, [activeTab, isOpen, categories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{title || "Transaction"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher (Expense vs Income) */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('expense')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
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
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Dropdown Kategori (Sudah terfilter) */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 cursor-pointer"
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              {filteredCategories.length === 0 && (
                <option disabled>No categories available</option>
              )}
            </select>
          </div>

          {/* Input Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700" 
              placeholder="What's this for?"
              required
            />
          </div>

          {/* Input Nominal */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Amount (Rp)</label>
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

          {/* Tombol Simpan */}
          <button 
            type="submit" 
            disabled={isLoading || filteredCategories.length === 0}
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] ${
              isLoading || filteredCategories.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                : activeTab === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            }`}
          >
            {isLoading ? "Saving..." : "Save Transaction"}
          </button>
        </form>

      </div>
    </div>
  );
}