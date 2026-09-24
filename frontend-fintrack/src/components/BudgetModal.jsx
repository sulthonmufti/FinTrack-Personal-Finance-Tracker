import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatRupiah } from '../utils/formatters';

export default function BudgetModal({ isOpen, onClose, onSubmit, categories = [], currentMonth, currentYear }) {
    const [categoryId, setCategoryId] = useState('');
    const [amountLimit, setAmountLimit] = useState('');

    // Filter fleksibel: Keluarkan yang bernilai pemasukan/income, sisanya anggap Pengeluaran
    const expenseCategories = categories.filter((c) => {
        if (!c.type) return true; // Jika type kosong/null, tetap tampilkan agar safe
        const typeLower = String(c.type).toLowerCase().trim();
        return typeLower !== 'income' && typeLower !== 'pemasukan' && typeLower !== 'in' && typeLower !== 'masuk';
    });

    useEffect(() => {
        if (isOpen) {
            console.log("=== DEBUG CATEGORIES AT MODAL ===", categories);
            console.log("=== FILTERED EXPENSE CATEGORIES ===", expenseCategories);

            if (expenseCategories.length > 0) {
                setCategoryId(expenseCategories[0].id);
            } else {
                setCategoryId('');
            }
            setAmountLimit('');
        }
    }, [isOpen, categories]);

    if (!isOpen) return null;

    const handleLimitChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setAmountLimit(formatRupiah(rawValue));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const numericAmount = parseFloat(amountLimit.replace(/\./g, '').replace(/,/g, '.') || 0);

        if (!categoryId) {
            alert("Silakan pilih kategori pengeluaran terlebih dahulu.");
            return;
        }

        onSubmit({
            category_id: categoryId,
            amount_limit: numericAmount,
            month: currentMonth,
            year: currentYear
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Set Category Budget</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Expense Category
                        </label>
                        {expenseCategories.length === 0 ? (
                            <p className="text-xs text-rose-500 font-medium bg-rose-50 p-3 rounded-xl border border-rose-100">
                                Belum ada kategori pengeluaran. Tambahkan kategori pengeluaran terlebih dahulu di menu Transactions.
                            </p>
                        ) : (
                            <select 
                                value={categoryId} 
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                required
                            >
                                {expenseCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name} {cat.type ? `(${cat.type})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Monthly Limit
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 font-bold text-sm select-none">Rp</span>
                            <input 
                                type="text" 
                                value={amountLimit} 
                                onChange={handleLimitChange} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-700 font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="0" 
                                required
                                disabled={expenseCategories.length === 0}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={expenseCategories.length === 0}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-3 text-sm"
                    >
                        Save Budget Limit
                    </button>
                </form>
            </div>
        </div>
    );
}