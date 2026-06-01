import { Trash2, ChevronLeft, ChevronRight, Edit2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export default function TransactionTable({ 
  transactions, 
  filterCategory, 
  setFilterCategory, 
  categories, 
  hideFilter,
  onDelete,
  onEdit,
  currentPage,
  totalPages,
  setCurrentPage,
  totalItems
}) {
  const hasData = transactions && transactions.length > 0;
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
      {/* Header Tabel */}
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Transactions</h2>
        {!hideFilter && (
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border-none text-slate-600 text-xs font-bold px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* TAMPILAN MOBILE (Card Layout) */}
      <div className="block md:hidden">
        {hasData ? (
          <div className="divide-y divide-slate-50">
            {transactions.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700 leading-tight">
                    {item.description}
                  </span>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {item.wallet_name || item.wallet || 'Main Wallet'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(item.transaction_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${item.type === 'expense' || Number(item.amount) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {item.type === 'expense' || Number(item.amount) < 0 ? '-' : '+'} Rp {Math.abs(parseFloat(item.amount)).toLocaleString('id-ID')}
                  </span>
                  
                  {!hideFilter && (
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === item.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                            <button 
                              onClick={() => { onEdit && onEdit(item); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button 
                              onClick={() => { onDelete && onDelete(item.id); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-50"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400 italic text-sm">Belum ada data transaksi.</div>
        )}
      </div>

      {/* tabel tampilan dekstop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
            <tr>
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4">Description</th>
              <th className="px-8 py-4 text-center">Category</th>
              <th className="px-8 py-4 text-center">Wallet</th>
              <th className="px-8 py-4 text-right">Amount</th>
              {!hideFilter && <th className="px-8 py-4 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {!hasData ? (
              <tr>
                <td colSpan={hideFilter ? 5 : 6} className="px-8 py-12 text-center text-slate-400 italic text-sm">
                  Belum ada data transaksi.
                </td>
              </tr>
            ) : (
              transactions.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-8 py-4 text-sm text-slate-500 font-medium">
                    {new Date(item.transaction_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-slate-600 max-w-[200px] truncate" title={item.description}>
                    {item.description}
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase">
                      {item.wallet_name || item.wallet || 'Main Wallet'}
                    </span>
                  </td>
                  <td className={`px-8 py-4 text-right text-sm font-bold ${item.type === 'expense' || Number(item.amount) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {item.type === 'expense' || Number(item.amount) < 0 ? '-' : '+'} Rp {Math.abs(parseFloat(item.amount)).toLocaleString('id-ID')}
                  </td>
                  {!hideFilter && (
                    <td className="px-8 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => onEdit && onEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete && onDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER PAGINATION */}
      {hasData && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <p className="text-xs text-slate-400 font-bold">
            Showing <span className="text-slate-600">{transactions.length}</span> of <span className="text-slate-600">{totalItems}</span> items
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}