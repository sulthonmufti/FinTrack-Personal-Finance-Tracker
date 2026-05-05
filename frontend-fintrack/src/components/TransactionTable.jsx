import { Trash2 } from 'lucide-react'; // Impor icon Trash

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
      <div className="p-6 md:p-8 flex justify-between items-center">
        <h3 className="text-lg font-bold">Recent Transactions</h3>
        
        {/* hidden filter kalau hideFilter true */}
        {!hideFilter && (
          <select 
            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-0 cursor-pointer"
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
             <option value="All">All Categories</option>
             {categories && categories.map(cat => (
               <option key={cat.id} value={cat.name}>{cat.name}</option>
             ))}
          </select>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
            <tr>
              <th className="px-6 md:px-10 py-5">Description</th>
              <th className="px-6 md:px-10 py-5 text-center">Category</th>
              <th className="px-6 md:px-10 py-5 text-right">Amount</th>
              {!hideFilter && <th className="px-6 md:px-10 py-5 text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/*pengaman untuk transactions*/}
            {transactions && transactions.length > 0 ? (
              transactions.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 md:px-10 py-4 md:py-6 text-sm font-semibold text-slate-700">{item.description}</td>
                  <td className="px-6 md:px-10 py-4 md:py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className={`px-6 md:px-10 py-4 md:py-6 text-right text-sm font-bold whitespace-nowrap ${Number(item.amount) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {Number(item.amount) < 0 ? '-' : '+'} Rp {Math.abs(Number(item.amount)).toLocaleString('id-ID')}
                  </td>
                  {/* Tombol Hapus */}
                  {!hideFilter && (
                    <td className="px-6 md:px-10 py-4 md:py-6 text-center">
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={hideFilter ? "3" : "4"} className="p-10 text-center text-slate-400 italic">
                  Belum ada transaksi terbaru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}