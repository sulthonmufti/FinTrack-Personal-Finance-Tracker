import { LayoutDashboard, Wallet, ArrowLeftRight, BarChart3, Settings, X, LogOut, UserRoundPen } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom';

const NavItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all
      ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}
    `}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </NavLink>
)

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Hapus semua data di storage
    localStorage.clear();
    //Arahkan kembali ke halaman login
    navigate('/login');
    //Paksa reload untuk memastikan state aplikasi bersih
    window.location.reload();
  };

  return (
    <>
      {/* Sidebar Overlay untuk mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[70] w-64 bg-white border-r border-slate-200 p-6 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between lg:justify-start gap-2 px-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic">F</div>
            <span className="text-xl font-bold tracking-tight">FinTrack</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
          <NavItem icon={Wallet} label="Wallets" to="/wallets" />
          <NavItem icon={ArrowLeftRight} label="Transactions" to="/transactions" />
          <NavItem icon={BarChart3} label="Reports" to="/reports" />
          <NavItem icon={Settings} label="Settings" to="/settings" />
          <NavItem icon={UserRoundPen} label="Edit Profile" to="/edit-profile" />
        </nav>

        {/* Tombol Logout di paling bawah */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}