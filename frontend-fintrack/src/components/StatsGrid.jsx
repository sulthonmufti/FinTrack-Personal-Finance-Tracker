import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

export default function StatsGrid({ totalBalance, pieData, chartData, COLORS, chartMode, setChartMode, showBalances, toggleBalanceButton, comparisonData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center relative min-h-[140px]"> 
                {/* button hide */}
                <div className="absolute top-5 right-5 z-10">
                    {toggleBalanceButton}
                </div>
                <p className="text-slate-400 text-[10px] font-bold tracking-widest mb-3 uppercase pr-10">
                    Total Balance
                </p>
                <h2 className="text-lg md:text-xl font-bold text-indigo-600 w-full break-all tracking-tight">
                    {showBalances ? `Rp ${totalBalance.toLocaleString('id-ID')}` : 'Rp ••••••••'}
                </h2>
                {comparisonData && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                        <span className={`font-bold px-1.5 py-0.5 rounded-md ${
                            comparisonData.isIncrease 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-rose-50 text-rose-600'
                        }`}>
                            {comparisonData.isIncrease ? '↑' : '↓'} {comparisonData.percentage}%
                        </span>
                        {/* <span className="text-slate-400 text-[11px]">
                            dari bulan lalu
                        </span> */}
                    </div>
                )}
            </div>

            {/* Pie Chart Card dengan Fitur Switch Mode */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center gap-4 hover:border-indigo-100 transition-all">
                <div className="w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie 
                                data={pieData} 
                                innerRadius={45} 
                                outerRadius={65} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="w-full sm:w-1/2 flex flex-col justify-between h-full py-1">
                    <div>
                        {/* ui switch mode expense dan income */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-3 border border-slate-200/40">
                            <button
                                onClick={() => setChartMode('expense')}
                                className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                    chartMode === 'expense' 
                                        ? 'bg-white text-rose-600 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Expenses
                            </button>
                            <button
                                onClick={() => setChartMode('income')}
                                className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                    chartMode === 'income' 
                                        ? 'bg-white text-emerald-600 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Income
                            </button>
                        </div>

                        <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                            {chartMode === 'expense' ? 'Expense Breakdown' : 'Income Sources'}
                        </h3>
                    </div>

                    {/* Legend List Kategori */}
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-3 gap-y-2 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {pieData.length === 0 ? (
                            <span className="text-xs text-slate-400 italic col-span-2 sm:col-span-1 py-1 px-1 bg-slate-50 rounded-lg">
                                No {chartMode} data found
                            </span>
                        ) : (
                            pieData.slice(0, 4).map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-[10px] md:text-xs font-medium text-slate-600 truncate">{entry.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Transaction Trend Card (AreaChart Recharts) */}
            <div className="bg-indigo-600 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden flex flex-col justify-between group">
                <div className="relative z-10">
                    <p className="opacity-70 text-[10px] font-bold tracking-widest uppercase">Transaction Trend</p>
                    <p className="text-xs opacity-90 mt-1 font-medium">Last 7 transactions</p>
                </div>
                
                {/* Wadah Grafik */}
                <div className="h-24 w-full mt-4 -mb-3 -mx-2 relative z-10 transition-transform group-hover:scale-105 duration-500">
                    {chartData && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                                    labelFormatter={(label, items) => items[0]?.payload?.name || label}
                                    contentStyle={{ 
                                        backgroundColor: '#1e293b', 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        color: '#fff',
                                        fontSize: '11px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '6 6' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#ffffff" 
                                    strokeWidth={2.5} 
                                    fillOpacity={1} 
                                    fill="url(#chartGradient)" 
                                    activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 3, fill: '#ffffff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-xs opacity-50 italic border-2 border-dashed border-white/20 rounded-2xl">
                            No data available
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
            </div>
        </div>
    );
}