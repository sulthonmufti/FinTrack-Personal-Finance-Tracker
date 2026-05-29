import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export const WALLET_THEMES = {
    indigo: 'bg-indigo-600',
    slate: 'bg-slate-800',
    emerald: 'bg-emerald-600',
    purple: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    sunset: 'bg-gradient-to-br from-rose-500 to-orange-500'
};

const AVAILABLE_COLORS = [
    { id: 'indigo', name: 'Indigo' },
    { id: 'slate', name: 'Dark Slate' },
    { id: 'emerald', name: 'Emerald' },
    { id: 'purple', name: 'Purple Gradient' },
    { id: 'sunset', name: 'Warm Sunset' }
];

export default function WalletModal({ isOpen, onClose, onSubmit, editData }) {
    const [name, setName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [balance, setBalance] = useState('');
    const [color, setColor] = useState('indigo');

    useEffect(() => {
        if (editData) {
            setName(editData.name);
            setAccountNumber(editData.account_number || '');
            setBalance(editData.balance);
            // Cek jika data lama berupa class, convert ke ID atau biarkan jika sudah ID
            const themeId = Object.keys(WALLET_THEMES).find(key => WALLET_THEMES[key] === editData.color) || editData.color;
            setColor(themeId || 'indigo');
        } else {
            setName('');
            setAccountNumber('');
            setBalance('');
            setColor('indigo');
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, account_number: accountNumber, balance: parseFloat(balance || 0), color });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">
                        {editData ? 'Edit Wallet' : 'Add New Wallet'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Wallet Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Bank BCA, Gopay" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Account Number</label>
                        <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 8410xxxxxx" />
                    </div>

                    {!editData && (
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Initial Balance (Rp)</label>
                            <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Card Theme</label>
                        <div className="flex gap-2 flex-wrap">
                            {AVAILABLE_COLORS.map((col) => (
                                <button
                                    key={col.id} type="button" onClick={() => setColor(col.id)}
                                    className={`w-10 h-10 rounded-xl transition-all ${WALLET_THEMES[col.id]} ${
                                        color === col.id ? 'ring-4 ring-indigo-500/40 scale-110' : 'opacity-80 hover:opacity-100'
                                    }`}
                                    title={col.name}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-2">
                        {editData ? 'Save Changes' : 'Create Wallet'}
                    </button>
                </form>
            </div>
        </div>
    );
}