import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import StatCard from '../ui/StatCard';

const TradePerformanceView = ({ trades }) => {
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
                { 
                    name: 'Profit', 
                    value: profitableTrades, 
                    color: '#10B981',
                    percentage: totalTrades > 0 ? ((profitableTrades / totalTrades) * 100).toFixed(1) : 0
                },
                { 
                    name: 'Loss', 
                    value: losingTrades, 
                    color: '#EF4444',
                    percentage: totalTrades > 0 ? ((losingTrades / totalTrades) * 100).toFixed(1) : 0
                },
            ].filter(item => item.value > 0) // Only show segments with data
        };
    }, [filteredTrades]);

    // Custom label function for the pie chart
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percentage < 5) return null; // Don't show labels for very small slices

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                className="font-semibold text-sm"
            >
                {`${percentage}%`}
            </text>
        );
    };

    // Custom tooltip content
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: data.color }}
                        />
                        <span className="text-white font-medium">{data.name}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-300">
                        <div>Count: {data.value}</div>
                        <div>Percentage: {data.percentage}%</div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom legend content
    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex justify-center space-x-6 mt-4">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-300 text-sm font-medium">
                            {entry.value} ({entry.payload.percentage}%)
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Trade Performance</h2>
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
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 shadow-lg relative">
                    <h3 className="text-xl font-semibold mb-4 text-white">Trade Outcomes</h3>
                    {stats.pieData.length > 0 && (stats.pieData[0].value > 0 || stats.pieData[1].value > 0) ? (
                        <div className="relative">
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <defs>
                                        <linearGradient id="profitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10B981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                        <linearGradient id="lossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#EF4444" />
                                            <stop offset="100%" stopColor="#DC2626" />
                                        </linearGradient>
                                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.3)"/>
                                        </filter>
                                    </defs>
                                    <Pie
                                        data={stats.pieData}
                                        cx="50%"
                                        cy="45%"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={110}
                                        innerRadius={40}
                                        fill="#8884d8"
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                        animationEasing="ease-out"
                                        stroke="#374151"
                                        strokeWidth={2}
                                        filter="url(#shadow)"
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.name === 'Profit' ? 'url(#profitGradient)' : 'url(#lossGradient)'}
                                                style={{
                                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend content={<CustomLegend />} />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Center text overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center" style={{ marginTop: '-20px' }}>
                                    <div className="text-2xl font-bold text-white">
                                        {stats.winRate}%
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Win Rate
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <div className="text-center">
                                <div className="text-lg">No closed trades yet</div>
                                <div className="text-sm mt-2 text-gray-400">
                                    Trade outcomes will appear here once you close some positions
                                </div>
                            </div>
                        </div>
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

export default TradePerformanceView;
