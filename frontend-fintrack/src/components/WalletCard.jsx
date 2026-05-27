import { CreditCard, Trash2, Edit2 } from 'lucide-react';

export default function WalletCard({ wallet, onSelect, isActive, onEdit, onDelete }) {
    return (
        <div 
            onClick={() => onSelect(wallet)}
            className={`p-6 rounded-[2rem] text-white shadow-lg transition-all transform cursor-pointer relative overflow-hidden group ${wallet.color} ${
                isActive ? 'ring-4 ring-indigo-500/30 scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
        >
            {/* Dekorasi Latar Belakang Lingkaran */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:bg-white/15 transition-all"></div>
            
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-white/70 text-[10px] font-bold tracking-widest uppercase mb-1">
                        {wallet.account_number || 'No Account Number'}
                    </p>
                    <h3 className="text-lg font-bold tracking-wide">{wallet.name}</h3>
                </div>
                <CreditCard className="opacity-60" size={24} />
            </div>

            <div className="mt-8 relative z-10 flex justify-between items-end">
                <div>
                    <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Balance</p>
                    <p className="text-xl font-bold tracking-tight">
                        Rp {parseFloat(wallet.balance).toLocaleString('id-ID')}
                    </p>
                </div>
                
                {/* Tombol Aksi kecil */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(wallet); }} 
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(wallet.id); }} 
                        className="p-1.5 hover:bg-rose-600/30 text-rose-200 hover:text-white rounded-lg transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}