import { LayoutDashboard, Wallet, ArrowLeftRight, BarChart3, Settings, X } from 'lucide-react'

// NavItem
const NavItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
)

export default function Sidebar({ isOpen, onClose }) {
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
        fixed lg:static inset-y-0 left-0 z-[70] w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between lg:justify-start gap-2 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic">F</div>
            <span className="text-xl font-bold tracking-tight">FinTrack</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400">
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" />
          <NavItem icon={Wallet} label="Wallets" active={true} />
          <NavItem icon={ArrowLeftRight} label="Transactions" />
          <NavItem icon={BarChart3} label="Reports" />
          <NavItem icon={Settings} label="Settings" />
        </nav>
      </aside>
    </>
  )
}