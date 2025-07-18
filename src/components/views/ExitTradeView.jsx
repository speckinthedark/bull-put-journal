import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import InputField from '../ui/InputField';

export default function ExitTradeView({ trades, updateTrade }) {
    const [selectedTradeId, setSelectedTradeId] = useState('');
    const [exitDetails, setExitDetails] = useState({ status: 'profit', finalPL: '', exitDate: new Date().toISOString().slice(0, 10) });

    const ongoingTrades = trades.filter(t => t.status === 'ongoing');

    const handleSelectTrade = (e) => {
        const tradeId = e.target.value;
        setSelectedTradeId(tradeId);
        if (tradeId) {
            const selectedTrade = ongoingTrades.find(t => t.id === tradeId);
            const fiftyPercentProfit = selectedTrade.maxProfit * 0.5;
            setExitDetails(prev => ({ ...prev, finalPL: fiftyPercentProfit.toFixed(2) }));
        } else {
            setExitDetails({ status: 'profit', finalPL: '', exitDate: new Date().toISOString().slice(0, 10) });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTradeId) return;
        updateTrade(selectedTradeId, {
            ...exitDetails,
            finalPL: parseFloat(exitDetails.finalPL),
        });
    };

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Exit a Trade</h2>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Select Ongoing Trade</label>
                    <div className="relative">
                        <select
                            value={selectedTradeId}
                            onChange={handleSelectTrade}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            <option value="">-- Select a trade --</option>
                            {ongoingTrades.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.ticker} {t.shortStrike}/{t.longStrike}P (Exp: {t.expirationDate})
                                </option>
                            ))}
                        </select>
                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {selectedTradeId && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Outcome</label>
                            <div className="flex space-x-4">
                                <button type="button" onClick={() => setExitDetails({...exitDetails, status: 'profit'})} className={`flex-1 py-2 rounded-md ${exitDetails.status === 'profit' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'}`}>Profit</button>
                                <button type="button" onClick={() => setExitDetails({...exitDetails, status: 'loss'})} className={`flex-1 py-2 rounded-md ${exitDetails.status === 'loss' ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}>Loss</button>
                            </div>
                        </div>
                        <InputField label="Final P/L" name="finalPL" type="number" step="0.01" value={exitDetails.finalPL} onChange={(e) => setExitDetails({...exitDetails, finalPL: e.target.value})} />
                        <InputField label="Exit Date" name="exitDate" type="date" value={exitDetails.exitDate} onChange={(e) => setExitDetails({...exitDetails, exitDate: e.target.value})} />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-blue-700"
                        >
                            Confirm Exit
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
