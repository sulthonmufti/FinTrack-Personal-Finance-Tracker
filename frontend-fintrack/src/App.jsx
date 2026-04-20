import { useEffect, useState } from 'react'
import axios from 'axios'
import './index.css'
//icon
const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}>
    <span className="text-lg">{icon}</span>
    <span className="font-medium text-sm">{label}</span>
  </div>
)

function App() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    axios.get('http://localhost:5000/api/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-200 p-6 flex flex-col gap-8 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
          <span className="text-xl font-bold tracking-tight">FinTrack</span>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem icon="🏠" label="Dashboard" />
          <NavItem icon="💳" label="Wallets" active={true} />
          <NavItem icon="📊" label="Transactions" />
          <NavItem icon="📈" label="Reports" />
          <NavItem icon="⚙️" label="Settings" />
        </nav>

        <div className="mt-auto bg-indigo-50 p-4 rounded-2xl">
          <p className="text-xs text-indigo-600 font-bold mb-1">PRO PLAN</p>
          <p className="text-xs text-indigo-400 mb-3">Get unlimited access to all features</p>
          <button className="w-full bg-white text-indigo-600 py-2 rounded-lg text-xs font-bold shadow-sm">Upgrade</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold">Wallets</h1>
            <p className="text-slate-500 text-sm">Manage your finances across all accounts</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-medium hover:bg-slate-50">Refresh</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200">+ Add Transaction</button>
          </div>
        </header>

        {/* Stats Grid (Placeholder seperti gambar) */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 text-xs font-medium mb-1">TOTAL BALANCE</p>
            <h2 className="text-3xl font-bold">$15,793.68</h2>
            <p className="text-emerald-500 text-xs mt-2 font-medium">↑ 12.5% <span className="text-slate-400">from last month</span></p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
             {/* Tempat Chart nantinya */}
             <p className="opacity-80 text-xs font-medium">MONTHLY ACTIVITY</p>
             <div className="h-20 flex items-end gap-2 mt-4">
                {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
                  <div key={i} style={{height: `${h}%`}} className="flex-1 bg-white/20 rounded-t-sm"></div>
                ))}
             </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold">Recent Transactions</h3>
            <button className="text-indigo-600 text-sm font-medium">View All</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-8 py-4 font-semibold">Description</th>
                <th className="px-8 py-4 font-semibold text-center">Category</th>
                <th className="px-8 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5 text-sm font-medium text-slate-700">{item.description}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-tight group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-bold text-slate-900">
                    Rp {Number(item.amount).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  )
}

export default App