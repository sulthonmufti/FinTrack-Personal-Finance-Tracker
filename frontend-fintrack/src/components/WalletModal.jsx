import { X, Pipette } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatRupiah } from '../utils/formatters';

export const WALLET_THEMES = {
    indigo: 'bg-indigo-600',
    slate: 'bg-slate-800',
    emerald: 'bg-emerald-600',
    purple: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    sunset: 'bg-gradient-to-br from-rose-500 to-orange-500',
    ocean: 'bg-gradient-to-br from-blue-600 to-cyan-500',
    midnight: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
    amber: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    rose: 'bg-gradient-to-br from-rose-600 to-pink-500',
    teal: 'bg-teal-600',
    violet: 'bg-gradient-to-br from-violet-600 to-fuchsia-600',
    coral: 'bg-gradient-to-br from-orange-500 to-pink-600',
    ruby: 'bg-gradient-to-br from-rose-700 to-red-900',
    mint: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    carbon: 'bg-gradient-to-br from-zinc-800 to-neutral-950'
};

const AVAILABLE_COLORS = [
    { id: 'indigo', name: 'Indigo' },
    { id: 'slate', name: 'Dark Slate' },
    { id: 'emerald', name: 'Emerald' },
    { id: 'purple', name: 'Purple Gradient' },
    { id: 'sunset', name: 'Warm Sunset' },
    { id: 'ocean', name: 'Ocean Breeze' },
    { id: 'midnight', name: 'Midnight' },
    { id: 'amber', name: 'Golden Amber' },
    { id: 'rose', name: 'Rose Pink' },
    { id: 'teal', name: 'Teal Green' },
    { id: 'violet', name: 'Electric Violet' },
    { id: 'coral', name: 'Coral Flare' },
    { id: 'ruby', name: 'Deep Ruby' },
    { id: 'mint', name: 'Fresh Mint' },
    { id: 'carbon', name: 'Carbon Fiber' }
];

export default function WalletModal({ isOpen, onClose, onSubmit, editData }) {
    const [name, setName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [balance, setBalance] = useState('');
    const [color, setColor] = useState('indigo');
    const [customColor, setCustomColor] = useState('#4f46e5');
    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        if (editData) {
            setName(editData.name);
            setAccountNumber(editData.account_number || '');
            setBalance(editData.balance ? formatRupiah(editData.balance.toString()) : '');
            
            const themeId = Object.keys(WALLET_THEMES).find(key => WALLET_THEMES[key] === editData.color) || editData.color;
            
            if (WALLET_THEMES[themeId]) {
                setColor(themeId);
                setIsCustom(false);
            } else if (editData.color?.startsWith('#')) {
                setColor(editData.color);
                setCustomColor(editData.color);
                setIsCustom(true);
            } else {
                setColor(themeId || 'indigo');
                setIsCustom(false);
            }
        } else {
            setName('');
            setAccountNumber('');
            setBalance('');
            setColor('indigo');
            setIsCustom(false);
            setCustomColor('#4f46e5');
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleBalanceChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setBalance(formatRupiah(rawValue));
    };

    const handleSelectPreset = (id) => {
        setColor(id);
        setIsCustom(false);
    };

    const handleCustomColorChange = (e) => {
        const hex = e.target.value;
        setCustomColor(hex);
        setColor(hex);
        setIsCustom(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const numericBalance = parseFloat(balance.toString().replace(/\./g, '').replace(/,/g, '.') || 0);

        onSubmit({ 
            name, 
            account_number: accountNumber, 
            balance: numericBalance, 
            color 
        });
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

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Wallet Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="e.g. Bank BCA, Gopay" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Account Number</label>
                        <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="e.g. 8410xxxxxx" />
                    </div>

                    {!editData && (
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Initial Balance</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-slate-400 font-bold text-sm select-none">Rp</span>
                                <input 
                                    type="text" 
                                    value={balance} 
                                    onChange={handleBalanceChange} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-700 font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="0" 
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Card Theme</label>
                        
                        {/* Container Swatches ringkas (2 baris x 8 kolom, tanpa scroll) */}
                        <div className="flex gap-2 flex-wrap items-center">
                            {AVAILABLE_COLORS.map((col) => (
                                <button
                                    key={col.id} 
                                    type="button" 
                                    onClick={() => handleSelectPreset(col.id)}
                                    className={`w-7 h-7 rounded-lg transition-all ${WALLET_THEMES[col.id]} ${
                                        !isCustom && color === col.id 
                                            ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105' 
                                            : 'opacity-85 hover:opacity-100 hover:scale-105'
                                    }`}
                                    title={col.name}
                                />
                            ))}

                            {/* Custom Color Picker Button */}
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="color"
                                    id="customColorPicker"
                                    value={customColor}
                                    onChange={handleCustomColorChange}
                                    className="sr-only"
                                />
                                <label
                                    htmlFor="customColorPicker"
                                    style={{ backgroundColor: isCustom ? customColor : undefined }}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all border border-dashed ${
                                        isCustom 
                                            ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105 text-white border-transparent' 
                                            : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200 hover:scale-105'
                                    }`}
                                    title="Custom Color"
                                >
                                    <Pipette size={13} />
                                </label>
                            </div>
                        </div>

                        {isCustom && (
                            <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                Warna Kustom Selected: <span className="font-mono font-bold text-slate-600">{customColor}</span>
                            </p>
                        )}
                    </div>

                    <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-3 text-sm">
                        {editData ? 'Save Changes' : 'Create Wallet'}
                    </button>
                </form>
            </div>
        </div>
    );
}