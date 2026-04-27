import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function StatsGrid({ totalBalance, pieData, chartData, COLORS }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {/* Saldo Card */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                <p className="text-slate-400 text-[10px] font-bold tracking-widest mb-2 uppercase">Total Balance</p>
                <h2 className="text-xl md:text-2xl font-bold text-indigo-600">Rp {totalBalance.toLocaleString('id-ID')}</h2>
            </div>

            {/* Pie Chart Card (Copy logika PieChart kamu ke sini) */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                        <Pie 
                            data={pieData} 
                            innerRadius={45} 
                            outerRadius={65} 
                            paddingAngle={5} 
                            dataKey="value"
                            // Tambahkan animationDuration agar render lebih halus
                            animationDuration={1000} 
                        >
                            {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                        />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                <div className="w-full sm:w-1/2 grid grid-cols-2 sm:grid-cols-1 gap-2">
                    <h3 className="text-sm font-bold text-slate-700 mb-1 col-span-2 sm:col-span-1">Expenses</h3>
                    {pieData.slice(0, 4).map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-[10px] md:text-xs font-medium text-slate-500 truncate">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-indigo-600 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden order-2 lg:order-3">
                <p className="opacity-70 text-[10px] font-bold tracking-widest uppercase">Trend</p>
                <div className="h-16 flex items-end gap-2 mt-4">
                    {chartData.map((h, i) => (
                        <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-white/20 rounded-full"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}