import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import StatCard from '../ui/StatCard';

const OverviewView = ({ trades }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const availableMonths = useMemo(() => {
        const months = new Set(trades.map(t => (t.exitDate || t.entryDate).slice(0, 7)));
        return Array.from(months).sort().reverse();
    }, [trades]);
    
    useEffect(() => {
        if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
            setSelectedMonth(availableMonths[0]);
        }
    }, [availableMonths, selectedMonth]);

    const filteredTrades = useMemo(() => {
        return trades.filter(t => {
            const tradeMonth = (t.exitDate || t.entryDate).slice(0, 7);
            return tradeMonth === selectedMonth && t.status !== 'ongoing';
        });
    }, [trades, selectedMonth]);

    const stats = useMemo(() => {
        const profitableTrades = filteredTrades.filter(t => t.status === 'profit').length;
        const losingTrades = filteredTrades.filter(t => t.status === 'loss').length;
        const totalPL = filteredTrades.reduce((acc, t) => acc + (t.finalPL || 0), 0);
        const totalTrades = profitableTrades + losingTrades;
        const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

        return {
            profitableTrades,
            losingTrades,
            totalPL,
            winRate: winRate.toFixed(1),
            pieData: [
                { name: 'Profit', value: profitableTrades, color: '#10B981' },
                { name: 'Loss', value: losingTrades, color: '#EF4444' },
            ]
        };
    }, [filteredTrades]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Performance Overview</h2>
                <div className="relative">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-md py-2 pl-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        {availableMonths.map(month => (
                            <option key={month} value={month}>
                                {new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total P/L" value={`$${stats.totalPL.toFixed(2)}`} isPositive={stats.totalPL >= 0} />
                <StatCard title="Win Rate" value={`${stats.winRate}%`} />
                <StatCard title="Closed Trades" value={stats.profitableTrades + stats.losingTrades} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Trade Outcomes</h3>
                    {stats.pieData[0].value > 0 || stats.pieData[1].value > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={stats.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {stats.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '0.5rem' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">No closed trades for this month.</div>
                    )}
                </div>
                <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
                     <h3 className="text-xl font-semibold mb-4">Closed Trades for {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-600 text-gray-400">
                                    <th className="p-2">Ticker</th>
                                    <th className="p-2">Strikes</th>
                                    <th className="p-2">Exit Date</th>
                                    <th className="p-2">Outcome</th>
                                    <th className="p-2 text-right">P/L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTrades.length > 0 ? filteredTrades.map(trade => (
                                    <tr key={trade.id} className="border-b border-gray-700">
                                        <td className="p-2 font-mono">{trade.ticker}</td>
                                        <td className="p-2 font-mono text-sm text-gray-300">
                                            {trade.shortStrike}/{trade.longStrike}
                                        </td>
                                        <td className="p-2">{trade.exitDate}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trade.status === 'profit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {trade.status}
                                            </span>
                                        </td>
                                        <td className={`p-2 text-right font-semibold ${trade.finalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${trade.finalPL.toFixed(2)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-4 text-gray-500">No trades to display.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewView;
