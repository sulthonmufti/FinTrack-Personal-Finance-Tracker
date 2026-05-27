import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Wallet, Menu } from 'lucide-react';
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import ProfileHeader from '../components/ProfileHeader';
import WalletCard from '../components/WalletCard';
import WalletModal from '../components/WalletModal';

export default function Wallets({ setIsSidebarOpen }) {
    const [wallets, setWallets] = useState([]);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);

    const fetchWallets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/wallets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWallets(res.rows || res.data);
            if (res.data.length > 0 && !selectedWallet) {
                setSelectedWallet(res.data[0]); // auto select dompet pertama
            }
        } catch (err) {
            console.error("Gagal sinkronisasi data dompet:", err);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const handleOpenAddModal = () => {
        setEditingWallet(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (wallet) => {
        setEditingWallet(wallet);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (editingWallet) {
                // Proses Edit
                await axios.put(`http://localhost:5000/api/wallets/${editingWallet.id}`, formData, { headers });
            } else {
                // Proses Tambah Baru
                await axios.post('http://localhost:5000/api/wallets', formData, { headers });
            }
            setIsModalOpen(false);
            fetchWallets();
        } catch (err) {
            console.error("Gagal mengeksekusi operasi dompet:", err);
        }
    };

    const handleDeleteWallet = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus dompet ini? Semua data transaksi terkait akan kehilangan referensi dompet.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/wallets/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchWallets();
            } catch (err) {
                console.error("Gagal menghapus dompet:", err);
            }
        }
    };

    // Hitung Akumulasi Total Saldo semua dompet
    const totalAccumulatedBalance = wallets.reduce((acc, curr) => acc + parseFloat(curr.balance), 0);

    return (
        <>
            {/* Header Area */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 lg:hidden transition-all">
                        <HiOutlineMenuAlt2 size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <Wallet className="text-indigo-600" size={28} /> My Wallets
                        </h1>
                        <p className="text-xs md:text-sm font-medium text-slate-400 mt-0.5">
                            Total gabungan saldo: <span className="font-bold text-indigo-600">Rp {totalAccumulatedBalance.toLocaleString('id-ID')}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
                    <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-100 active:scale-95">
                        <Plus size={16} /> Add Wallet
                    </button>
                    <div className="border-l border-slate-200 pl-2">
                        <ProfileHeader />
                    </div>
                </div>
            </header>

            {/* Grid Layout Daftar Kartu Dompet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {wallets.length === 0 ? (
                    <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 p-8 text-center rounded-[2rem] text-slate-400 italic text-sm">
                        Belum ada dompet. Klik "Add Wallet" untuk membuat dompet pertama Anda.
                    </div>
                ) : (
                    wallets.map(wallet => (
                        <WalletCard
                            key={wallet.id} wallet={wallet}
                            onSelect={setSelectedWallet}
                            isActive={selectedWallet?.id === wallet.id}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDeleteWallet}
                        />
                    ))
                )}
            </div>

            {/* MODAL CONTAINER */}
            <WalletModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                editData={editingWallet}
            />
        </>
    );
}