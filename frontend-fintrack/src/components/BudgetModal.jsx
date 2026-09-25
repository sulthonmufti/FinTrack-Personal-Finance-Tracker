import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function BudgetModal({ isOpen, onClose, onSubmit, categories, currentMonth, currentYear, editData }) {
    const [categoryId, setCategoryId] = useState('');
    const [displayAmount, setDisplayAmount] = useState('');

    useEffect(() => {
        if (editData) {
            setCategoryId(editData.category_id || '');
            const rawLimit = editData.amount_limit ? Math.round(parseFloat(editData.amount_limit)) : '';
            setDisplayAmount(rawLimit ? formatRupiah(rawLimit) : '');
        } else {
            setCategoryId(categories.length > 0 ? categories[0].id : '');
            setDisplayAmount('');
        }
    }, [editData, isOpen, categories]);

    if (!isOpen) return null;

    const handleAmountChange = (e) => {
        const rawValue = e.target.value;
        setDisplayAmount(formatRupiah(rawValue));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const rawAmount = displayAmount.replace(/[^0-9]/g, '');
        onSubmit({
            category_id: categoryId,
            amount_limit: rawAmount,
            month: currentMonth,
            year: currentYear
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">
                        {editData ? 'Edit Batas Anggaran' : 'Atur Batas Anggaran Baru'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Kategori</label>
                        <select 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(e.target.value)}
                            disabled={!!editData}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Batas Anggaran</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-sm font-bold text-slate-400">Rp</span>
                            <input 
                                type="text"
                                placeholder="1.500.000"
                                value={displayAmount}
                                onChange={handleAmountChange}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all"
                        >
                            {editData ? 'Simpan Perubahan' : 'Simpan Budget'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}