import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Plus, AlertTriangle, AlertCircle, CheckCircle2, Trash2, Pencil } from 'lucide-react';
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import ProfileHeader from '../components/ProfileHeader';
import BudgetModal from '../components/BudgetModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function Budgets({ setIsSidebarOpen }) {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editingBudget, setEditingBudget] = useState(null);
    
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchBudgets();
        fetchCategories();
    }, [selectedMonth, selectedYear]);

    const fetchBudgets = async () => {
        try {
            const res = await API.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
            setBudgets(res.data);
        } catch (err) {
            console.error("Failed to fetch budgets", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await API.get('/transactions/categories');
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const handleSaveBudget = async (data) => {
        try {
            if (editingBudget) {
                await API.put(`/budgets/${editingBudget.id}`, data);
            } else {
                await API.post('/budgets', data);
            }
            handleCloseModal();
            fetchBudgets();
        } catch (err) {
            console.error("Failed to save budget", err);
        }
    };

    const handleDeleteBudget = async () => {
        if (!deleteId) return;
        try {
            await API.delete(`/budgets/${deleteId}`);
            setDeleteId(null);
            fetchBudgets();
        } catch (err) {
            console.error("Failed to delete budget", err);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingBudget(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (budget) => {
        setEditingBudget(budget);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
    };

    const exceededBudgets = budgets.filter(b => parseFloat(b.spent) >= parseFloat(b.amount_limit));
    const warningBudgets = budgets.filter(b => {
        const pct = (parseFloat(b.spent) / parseFloat(b.amount_limit)) * 100;
        return pct >= 80 && pct < 100;
    });

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* HEADER RESPONSIF */}
            <header className="space-y-4 mb-6">
                {/* Baris Atas: Sidebar Toggle, Judul, & Profile */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen && setIsSidebarOpen(true)}
                            className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 active:scale-90 transition-all shadow-sm"
                        >
                            <HiOutlineMenuAlt2 size={22} />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Budget Limits</h1>
                            <p className="text-slate-500 text-xs hidden sm:block">Kelola batas pengeluaran bulanan per kategori</p>
                        </div>
                    </div>

                    <div>
                        <ProfileHeader />
                    </div>
                </div>

                {/* Baris Filter & Tombol Aksi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Select Bulan & Tahun Split 50-50 di Mobile */}
                    <div className="grid grid-cols-2 gap-2.5 sm:w-auto">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                </option>
                            ))}
                        </select>

                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            {[2025, 2026, 2027].map(yr => (
                                <option key={yr} value={yr}>{yr}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tombol Set Budget Full Width di Mobile */}
                    <button 
                        onClick={handleOpenCreateModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Set Budget</span>
                    </button>
                </div>
            </header>

            {/* ALERT BANNER SECTION */}
            {exceededBudgets.length > 0 && (
                <div className="bg-rose-500 text-white rounded-2xl p-4 flex items-start gap-3 shadow-md shadow-rose-200">
                    <AlertCircle size={22} className="shrink-0 mt-0.5 text-white" />
                    <div>
                        <h4 className="font-bold text-sm">Peringatan: Over Budget!</h4>
                        <p className="text-xs text-rose-100 mt-0.5">
                            {exceededBudgets.length} kategori ({exceededBudgets.map(b => b.category_name).join(', ')}) telah melebihi batas anggaran.
                        </p>
                    </div>
                </div>
            )}

            {warningBudgets.length > 0 && exceededBudgets.length === 0 && (
                <div className="bg-amber-500 text-white rounded-2xl p-4 flex items-start gap-3 shadow-md shadow-amber-200">
                    <AlertTriangle size={22} className="shrink-0 mt-0.5 text-white" />
                    <div>
                        <h4 className="font-bold text-sm">Perhatian: Mendekati Batas Budget</h4>
                        <p className="text-xs text-amber-100 mt-0.5">
                            Kategori ({warningBudgets.map(b => b.category_name).join(', ')}) telah mencapai lebih dari 80% dari batas pengeluaran.
                        </p>
                    </div>
                </div>
            )}

            {/* GRID BUDGET CARDS */}
            {budgets.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                    <p className="text-slate-400 font-medium text-sm">Belum ada batas anggaran yang diatur untuk bulan ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {budgets.map((item) => {
                        const limit = parseFloat(item.amount_limit);
                        const spent = parseFloat(item.spent);
                        const percentage = Math.min(Math.round((spent / limit) * 100), 100);
                        const rawPercentage = ((spent / limit) * 100).toFixed(1);

                        let statusColor = "bg-emerald-500";
                        let badgeStyle = "bg-emerald-500 text-white shadow-sm shadow-emerald-200";
                        let IconBadge = CheckCircle2;

                        if (spent >= limit) {
                            statusColor = "bg-rose-600";
                            badgeStyle = "bg-rose-600 text-white shadow-sm shadow-rose-200";
                            IconBadge = AlertCircle;
                        } else if (rawPercentage >= 80) {
                            statusColor = "bg-amber-500";
                            badgeStyle = "bg-amber-500 text-white shadow-sm shadow-amber-200";
                            IconBadge = AlertTriangle;
                        }

                        return (
                            <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">{item.category_name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Limit: Rp {limit.toLocaleString('id-ID')}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${badgeStyle}`}>
                                            <IconBadge size={13} className="shrink-0" />
                                            {rawPercentage}%
                                        </span>

                                        <button 
                                            onClick={() => handleOpenEditModal(item)}
                                            className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-xl hover:bg-indigo-50 transition-colors ml-1"
                                            title="Edit Budget"
                                        >
                                            <Pencil size={15} />
                                        </button>

                                        <button 
                                            onClick={() => setDeleteId(item.id)}
                                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                                            title="Hapus Budget"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${statusColor}`} 
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-xs mt-2.5 font-medium">
                                        <span className="text-slate-500">Terpakai: <strong className="text-slate-800">Rp {spent.toLocaleString('id-ID')}</strong></span>
                                        <span className={spent >= limit ? "text-rose-600 font-bold" : "text-slate-400"}>
                                            {spent >= limit ? "Over Budget" : `Sisa: Rp ${(limit - spent).toLocaleString('id-ID')}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL BUDGET */}
            <BudgetModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSaveBudget}
                categories={categories}
                currentMonth={selectedMonth}
                currentYear={selectedYear}
                editData={editingBudget}
            />

            {/* MODAL KONFIRMASI HAPUS */}
            <DeleteConfirmModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteBudget}
                title="Hapus Batas Anggaran"
                message="Apakah Anda yakin ingin menghapus batas anggaran untuk kategori ini?"
            />
        </div>
    );
}