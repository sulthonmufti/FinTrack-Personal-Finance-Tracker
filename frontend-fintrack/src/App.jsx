import { useEffect, useState } from 'react'
import axios from 'axios'
import './index.css'

function App() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    axios.get('http://localhost:5000/api/transactions')
      .then(response => {
        setTransactions(response.data)
      })
      .catch(error => {
        console.error("Gagal ambil data:", error)
      })
  }, [])

  return (
    // Gunakan bg-slate-50 untuk background abu-abu terang yang profesional
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          FinTrack Dashboard
        </h1>

        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Deskripsi</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Jumlah</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-700">{item.description}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    Rp {Number(item.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  )
}

export default App