import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

const AccountOverviewView = ({ trades, user }) => {
    const [accountBalance, setAccountBalance] = useState(10000); // Default starting balance
    const [showContributionModal, setShowContributionModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [contributionAmount, setContributionAmount] = useState('');
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [accountHistory, setAccountHistory] = useState([]);

    // Load account data from localStorage
    useEffect(() => {
        const savedBalance = localStorage.getItem('accountBalance');
        const savedHistory = localStorage.getItem('accountHistory');
        
        if (savedBalance) {
            setAccountBalance(parseFloat(savedBalance));
        }
        if (savedHistory) {
            setAccountHistory(JSON.parse(savedHistory));
        }
    }, []);

    // Calculate account balance history including trades
    const balanceHistory = useMemo(() => {
        const events = [];
        
        // Add manual contributions/withdrawals
        accountHistory.forEach(entry => {
            events.push({
                date: entry.date,
                type: entry.type,
                amount: entry.amount,
                description: entry.description,
                timestamp: new Date(entry.date).getTime()
            });
        });

        // Add trade P/L events
        trades.filter(t => t.status !== 'ongoing' && t.exitDate).forEach(trade => {
            events.push({
                date: trade.exitDate,
                type: trade.finalPL >= 0 ? 'trade_profit' : 'trade_loss',
                amount: trade.finalPL,
                description: `${trade.ticker} Bull Put Spread`,
                timestamp: new Date(trade.exitDate).getTime()
            });
        });

        // Sort by date
        events.sort((a, b) => a.timestamp - b.timestamp);

        // Calculate running balance
        let runningBalance = 10000; // Starting balance
        const chartData = [{
            date: new Date().getFullYear() + '-01-01',
            balance: runningBalance,
            type: 'initial'
        }];

        events.forEach(event => {
            runningBalance += event.amount;
            chartData.push({
                date: event.date,
                balance: runningBalance,
                type: event.type,
                amount: event.amount,
                description: event.description
            });
        });

        return { events, chartData };
    }, [trades, accountHistory]);

    const handleContribution = () => {
        const amount = parseFloat(contributionAmount);
        if (!amount || amount <= 0) return;

        const newEntry = {
            date: new Date().toISOString().split('T')[0],
            type: 'contribution',
            amount: amount,
            description: 'Manual contribution'
        };

        try {
            const newBalance = accountBalance + amount;
            const newHistory = [...accountHistory, newEntry];

            // Save to localStorage
            localStorage.setItem('accountBalance', newBalance.toString());
            localStorage.setItem('accountHistory', JSON.stringify(newHistory));

            setAccountBalance(newBalance);
            setAccountHistory(newHistory);
            setContributionAmount('');
            setShowContributionModal(false);
        } catch (error) {
            console.error('Error adding contribution:', error);
            alert('Error adding contribution: ' + error.message);
        }
    };

    const handleWithdrawal = () => {
        const amount = parseFloat(withdrawalAmount);
        if (!amount || amount <= 0 || amount > accountBalance) return;

        const newEntry = {
            date: new Date().toISOString().split('T')[0],
            type: 'withdrawal',
            amount: -amount,
            description: 'Manual withdrawal'
        };

        try {
            const newBalance = accountBalance - amount;
            const newHistory = [...accountHistory, newEntry];

            // Save to localStorage
            localStorage.setItem('accountBalance', newBalance.toString());
            localStorage.setItem('accountHistory', JSON.stringify(newHistory));

            setAccountBalance(newBalance);
            setAccountHistory(newHistory);
            setWithdrawalAmount('');
            setShowWithdrawalModal(false);
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            alert('Error processing withdrawal: ' + error.message);
        }
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-lg">
                    <div className="text-white font-medium mb-2">
                        {new Date(label).toLocaleDateString()}
                    </div>
                    <div className="text-green-400 font-semibold">
                        Balance: ${data.balance.toLocaleString()}
                    </div>
                    {data.amount && (
                        <div className={`text-sm mt-1 ${data.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {data.amount >= 0 ? '+' : ''}${data.amount.toFixed(2)}
                        </div>
                    )}
                    {data.description && (
                        <div className="text-gray-300 text-sm mt-1">
                            {data.description}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const totalContributions = accountHistory
            .filter(entry => entry.type === 'contribution')
            .reduce((sum, entry) => sum + entry.amount, 0);
        
        const totalWithdrawals = Math.abs(accountHistory
            .filter(entry => entry.type === 'withdrawal')
            .reduce((sum, entry) => sum + entry.amount, 0));
        
        const tradingPL = trades
            .filter(t => t.status !== 'ongoing')
            .reduce((sum, t) => sum + (t.finalPL || 0), 0);
        
        const netDeposits = totalContributions - totalWithdrawals;
        const totalReturn = accountBalance - 10000 - netDeposits;
        const returnPercentage = netDeposits > 0 ? (totalReturn / (10000 + netDeposits)) * 100 : 0;

        return {
            totalContributions,
            totalWithdrawals,
            tradingPL,
            netDeposits,
            totalReturn,
            returnPercentage
        };
    }, [accountBalance, accountHistory, trades]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Account Overview</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowContributionModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Funds</span>
                    </button>
                    <button
                        onClick={() => setShowWithdrawalModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Minus className="h-4 w-4" />
                        <span>Withdraw</span>
                    </button>
                </div>
            </div>

            {/* Account Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Current Balance</p>
                            <p className="text-2xl font-bold text-white">${accountBalance.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-500" />
                    </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Trading P/L</p>
                            <p className={`text-2xl font-bold ${stats.tradingPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${stats.tradingPL.toFixed(2)}
                            </p>
                        </div>
                        <TrendingUp className={`h-8 w-8 ${stats.tradingPL >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Net Deposits</p>
                            <p className="text-2xl font-bold text-white">${stats.netDeposits.toLocaleString()}</p>
                        </div>
                        <Plus className="h-8 w-8 text-gray-500" />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Return</p>
                            <p className={`text-2xl font-bold ${stats.returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stats.returnPercentage.toFixed(1)}%
                            </p>
                        </div>
                        <TrendingUp className={`h-8 w-8 ${stats.returnPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                </div>
            </div>

            {/* Balance Trend Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Account Balance Trend</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={balanceHistory.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#9CA3AF"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            stroke="#9CA3AF"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            dot={(props) => {
                                const { payload } = props;
                                if (!payload.type || payload.type === 'initial') return null;
                                
                                let color = '#3B82F6';
                                if (payload.type === 'contribution') color = '#10B981';
                                else if (payload.type === 'withdrawal') color = '#EF4444';
                                else if (payload.type === 'trade_profit') color = '#10B981';
                                else if (payload.type === 'trade_loss') color = '#EF4444';
                                
                                return <circle {...props} r={6} fill={color} stroke="#fff" strokeWidth={2} />;
                            }}
                            activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#3B82F6' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Account Activity Table */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Account Activity</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-600 text-gray-400">
                                <th className="p-2">Date</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Description</th>
                                <th className="p-2 text-right">Amount</th>
                                <th className="p-2 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {balanceHistory.events.slice().reverse().map((event, index) => {
                                const balance = balanceHistory.chartData.find(d => d.date === event.date)?.balance || 0;
                                return (
                                    <tr key={index} className="border-b border-gray-700">
                                        <td className="p-2 text-gray-300">
                                            {new Date(event.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                event.type === 'contribution' ? 'bg-green-500/20 text-green-400' :
                                                event.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' :
                                                event.type === 'trade_profit' ? 'bg-green-500/20 text-green-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                                {event.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-2 text-gray-300">{event.description}</td>
                                        <td className={`p-2 text-right font-semibold ${
                                            event.amount >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {event.amount >= 0 ? '+' : ''}${event.amount.toFixed(2)}
                                        </td>
                                        <td className="p-2 text-right font-semibold text-white">
                                            ${balance.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                            {balanceHistory.events.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center p-4 text-gray-500">
                                        No account activity yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Contribution Modal */}
            {showContributionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Add Funds</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    value={contributionAmount}
                                    onChange={(e) => setContributionAmount(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowContributionModal(false);
                                        setContributionAmount('');
                                    }}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleContribution}
                                    disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Add Funds
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawal Modal */}
            {showWithdrawalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    value={withdrawalAmount}
                                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="0.00"
                                    min="0"
                                    max={accountBalance}
                                    step="0.01"
                                    autoFocus
                                />
                                <p className="text-sm text-gray-400 mt-1">
                                    Available: ${accountBalance.toLocaleString()}
                                </p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowWithdrawalModal(false);
                                        setWithdrawalAmount('');
                                    }}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWithdrawal}
                                    disabled={!withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || parseFloat(withdrawalAmount) > accountBalance}
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountOverviewView;
