import { X } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'

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
  setCategoryId
}) {
  if (!isOpen) return null;

  return (
    //Modal untuk menambahkan transaksi
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold">Add Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
              type="text"
              value={formatRupiah(amount)}
              onChange={(e) => {
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
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all ${
              isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
            }`}>
            {isLoading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}