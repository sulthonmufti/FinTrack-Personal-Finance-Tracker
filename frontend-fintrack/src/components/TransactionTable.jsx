import { Trash2 } from 'lucide-react';

export default function TransactionTable({ 
  transactions, 
  filterCategory, 
  setFilterCategory, 
  categories, 
  hideFilter,
  onDelete 
}) {
  return (
    <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
      {/* Header Tabel (Desktop & Mobile) */}
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Transactions</h2>
        {!hideFilter && (
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border-none text-slate-600 text-xs font-bold px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* TAMPILAN MOBILE (Card Layout) - Hanya muncul di layar kecil */}
      <div className="block md:hidden">
        {transactions && transactions.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {transactions.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-800">{item.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">12 Mei 2026</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-black ${Number(item.amount) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {Number(item.amount) < 0 ? '-' : '+'} Rp {Math.abs(Number(item.amount)).toLocaleString('id-ID')}
                  </span>
                  
                  {!hideFilter && (
                    <button 
                      onClick={() => onDelete(item)}
                      className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400 italic text-sm">Tidak ada transaksi</div>
        )}
      </div>

      {/* TAMPILAN DESKTOP (Tabel Tradisional) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
            <tr>
              <th className="px-10 py-5">Description</th>
              <th className="px-10 py-5 text-center">Category</th>
              <th className="px-10 py-5 text-right">Amount</th>
              {!hideFilter && <th className="px-10 py-5 text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-10 py-6 text-sm font-semibold text-slate-700">{item.description}</td>
                <td className="px-10 py-6 text-center">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase">
                    {item.category}
                  </span>
                </td>
                <td className={`px-10 py-6 text-right text-sm font-bold ${Number(item.amount) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {Number(item.amount) < 0 ? '-' : '+'} Rp {Math.abs(Number(item.amount)).toLocaleString('id-ID')}
                </td>
                {!hideFilter && (
                  <td className="px-10 py-6 text-center">
                    <button 
                      onClick={() => onDelete(item)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}