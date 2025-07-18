import React, { useState, useMemo } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';

export default function DeleteTradeView({ trades, deleteTrade }) {
    const [selectedTradeId, setSelectedTradeId] = useState('');

    const sortedTrades = useMemo(() => {
        return [...trades].sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
    }, [trades]);

    const selectedTrade = useMemo(() => {
        return trades.find(t => t.id === selectedTradeId);
    }, [trades, selectedTradeId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTradeId) return;
        if (window.confirm(`Are you sure you want to permanently delete the trade for ${selectedTrade.ticker}? This action cannot be undone.`)) {
            deleteTrade(selectedTradeId);
            setSelectedTradeId('');
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Delete a Trade</h2>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Select Trade to Delete</label>
                    <div className="relative">
                        <select
                            value={selectedTradeId}
                            onChange={(e) => setSelectedTradeId(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            <option value="">-- Select a trade --</option>
                            {sortedTrades.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.ticker} {t.shortStrike}/{t.longStrike}P (Entered: {t.entryDate}, Status: {t.status})
                                </option>
                            ))}
                        </select>
                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {selectedTradeId && (
                    <>
                        <div className="text-center p-4 bg-gray-900 rounded-lg">
                            <p className="font-bold text-lg">{selectedTrade.ticker} {selectedTrade.shortStrike}/{selectedTrade.longStrike}P</p>
                            <p className="text-sm text-gray-400">
                                Entered: {selectedTrade.entryDate} | Status: <span className={selectedTrade.status === 'ongoing' ? 'text-yellow-400' : selectedTrade.status === 'profit' ? 'text-green-400' : 'text-red-400'}>{selectedTrade.status}</span>
                            </p>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-red-700 flex items-center justify-center"
                        >
                            <Trash2 className="h-5 w-5 mr-2" />
                            Permanently Delete Trade
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
