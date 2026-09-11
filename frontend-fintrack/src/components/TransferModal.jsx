import { useState, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function TransferModal({ isOpen, onClose, wallets, onSubmit }) {
    const [fromWalletId, setFromWalletId] = useState('');
    const [toWalletId, setToWalletId] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (wallets && wallets.length >= 2) {
            setFromWalletId(wallets[0].id);
            setToWalletId(wallets[1].id);
        } else if (wallets && wallets.length === 1) {
            setFromWalletId(wallets[0].id);
        }
        setAmount('');
        setNotes('');
    }, [isOpen, wallets]);

    if (!isOpen) return null;

    const selectedFromWallet = wallets.find(w => String(w.id) === String(fromWalletId));
    const numericAmount = parseFloat(amount.toString().replace(/\./g, '').replace(/,/g, '.') || 0);
    const isInsufficient = selectedFromWallet && numericAmount > parseFloat(selectedFromWallet.balance || 0);

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setAmount(formatRupiah(rawValue));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (String(fromWalletId) === String(toWalletId)) {
            alert('Dompet asal dan dompet tujuan tidak boleh sama!');
            return;
        }
        if (isInsufficient) {
            alert('Saldo dompet asal tidak mencukupi!');
            return;
        }

        onSubmit({
            from_wallet_id: fromWalletId,
            to_wallet_id: toWalletId,
            amount: numericAmount,
            notes
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ArrowRightLeft className="text-indigo-600" size={22} /> Transfer Funds
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                    {/* Source Wallet */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">From Wallet</label>
                        <select 
                            value={fromWalletId} 
                            onChange={(e) => {
                                setFromWalletId(e.target.value);
                                if (String(e.target.value) === String(toWalletId)) {
                                    const nextTo = wallets.find(w => String(w.id) !== String(e.target.value));
                                    if (nextTo) setToWalletId(nextTo.id);
                                }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm"
                        >
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.name} (Rp {parseFloat(w.balance || 0).toLocaleString('id-ID')})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Destination Wallet */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">To Wallet</label>
                        <select 
                            value={toWalletId} 
                            onChange={(e) => setToWalletId(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm"
                        >
                            {wallets.filter(w => String(w.id) !== String(fromWalletId)).map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.name} (Rp {parseFloat(w.balance || 0).toLocaleString('id-ID')})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Transfer Amount */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Transfer Amount</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 font-bold text-sm select-none">Rp</span>
                            <input 
                                type="text" 
                                value={amount} 
                                onChange={handleAmountChange} 
                                required
                                className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 font-bold text-lg focus:outline-none focus:ring-2 ${
                                    isInsufficient ? 'border-rose-300 text-rose-600 focus:ring-rose-500' : 'border-slate-200 text-slate-700 focus:ring-indigo-500'
                                }`}
                                placeholder="0" 
                            />
                        </div>
                        {isInsufficient && (
                            <p className="text-xs text-rose-500 font-medium mt-1">Saldo dompet asal tidak mencukupi.</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Notes (Optional)</label>
                        <input 
                            type="text" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                            placeholder="e.g. Top up E-Wallet, Pindah dana" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isInsufficient || !numericAmount || wallets.length < 2}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                        Execute Transfer
                    </button>
                </form>
            </div>
        </div>
    );
}