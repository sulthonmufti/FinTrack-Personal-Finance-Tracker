import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Plus, AlertTriangle, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import BudgetModal from '../components/BudgetModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    
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

    const handleCreateBudget = async (data) => {
        try {
            await API.post('/budgets', data);
            setIsModalOpen(false);
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

    // Filter budget yang melebihi limit untuk banner pemicu alert
    const exceededBudgets = budgets.filter(b => parseFloat(b.spent) >= parseFloat(b.amount_limit));
    const warningBudgets = budgets.filter(b => {
        const pct = (parseFloat(b.spent) / parseFloat(b.amount_limit)) * 100;
        return pct >= 80 && pct < 100;
    });

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header & Month Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Budget Limits & Alerts</h1>
                    <p className="text-slate-500 text-sm">Kelola batas pengeluaran bulanan per kategori.</p>
                </div>

                <div className="flex items-center gap-3">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none"
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
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none"
                    >
                        {[2025, 2026, 2027].map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                        ))}
                    </select>

                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-100 transition-all"
                    >
                        <Plus size={18} />
                        Set Budget
                    </button>
                </div>
            </div>

            {/* Alert Banner Section */}
            {exceededBudgets.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 animate-fadeIn">
                    <AlertCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm">Peringatan: Over Budget!</h4>
                        <p className="text-xs text-rose-600 mt-0.5">
                            {exceededBudgets.length} kategori ({exceededBudgets.map(b => b.category_name).join(', ')}) telah melebihi batas anggaran yang ditentukan.
                        </p>
                    </div>
                </div>
            )}

            {warningBudgets.length > 0 && exceededBudgets.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800 animate-fadeIn">
                    <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm">Perhatian: Mendekati Batas Budget</h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Kategori ({warningBudgets.map(b => b.category_name).join(', ')}) telah mencapai lebih dari 80% dari batas pengeluaran.
                        </p>
                    </div>
                </div>
            )}

            {/* Grid Progress Budget Cards */}
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

                        let statusColor = "bg-indigo-600";
                        let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        let IconBadge = CheckCircle2;

                        if (spent >= limit) {
                            statusColor = "bg-rose-500";
                            badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                            IconBadge = AlertCircle;
                        } else if (rawPercentage >= 80) {
                            statusColor = "bg-amber-500";
                            badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
                            IconBadge = AlertTriangle;
                        }

                        return (
                            <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">{item.category_name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Limit: Rp {limit.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${badgeStyle}`}>
                                            <IconBadge size={13} />
                                            {rawPercentage}%
                                        </span>
                                        <button 
                                            onClick={() => setDeleteId(item.id)}
                                            className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${statusColor}`} 
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-xs mt-2 font-medium">
                                        <span className="text-slate-500">Terpakai: <strong className="text-slate-700">Rp {spent.toLocaleString('id-ID')}</strong></span>
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

            {/* Modals */}
            <BudgetModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateBudget}
                categories={categories}
                currentMonth={selectedMonth}
                currentYear={selectedYear}
            />

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