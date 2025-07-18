import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import DTECircularProgress from './DTECircularProgress';
import { calculateDTE, isGammaRisk, formatCurrency } from '../../utils/tradeCalculations';

const TradeCard = ({ trade, updateTrade, showExitButton = false }) => {
    const [showExitModal, setShowExitModal] = useState(false);
    const [exitDetails, setExitDetails] = useState({
        status: 'profit',
        finalPL: '',
        exitDate: new Date().toISOString().slice(0, 10)
    });

    const dte = calculateDTE(trade.expirationDate);
    const isInGammaRisk = isGammaRisk(dte);

    const handleExitClick = () => {
        // Pre-populate with 50% of max profit as default
        const fiftyPercentProfit = trade.maxProfit * 0.5;
        setExitDetails(prev => ({
            ...prev,
            status: 'profit',
            finalPL: fiftyPercentProfit.toFixed(2)
        }));
        setShowExitModal(true);
    };

    const handleStatusChange = (newStatus) => {
        let defaultAmount = '';
        if (newStatus === 'profit') {
            // Default to 50% of max profit
            defaultAmount = (trade.maxProfit * 0.5).toFixed(2);
        } else {
            // Default to 100% of max loss for loss scenario
            defaultAmount = trade.maxLoss.toFixed(2);
        }
        
        setExitDetails({
            ...exitDetails,
            status: newStatus,
            finalPL: defaultAmount
        });
    };

    const handleExitSubmit = () => {
        if (!exitDetails.finalPL) return;
        
        // Parse the absolute value of the input
        let finalPL = Math.abs(parseFloat(exitDetails.finalPL));
        
        // If status is 'loss', make the P/L negative
        if (exitDetails.status === 'loss') {
            finalPL = -finalPL;
        }
        
        updateTrade(trade.id, {
            ...exitDetails,
            finalPL: finalPL,
        });
        setShowExitModal(false);
    };

    return (
        <>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold font-mono">{trade.ticker}</h3>
                    <DTECircularProgress dte={dte} isGammaRisk={isInGammaRisk} />
                </div>
                <div className="text-sm text-gray-400">
                    <p>Entry: {trade.entryDate}</p>
                    <p>Expiry: {trade.expirationDate}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center pt-2">
                    <div>
                        <p className="text-xs text-gray-500">Strikes</p>
                        <p className="font-semibold text-lg">{trade.shortStrike} / {trade.longStrike}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Breakeven</p>
                        <p className="font-semibold text-lg">{formatCurrency(trade.breakeven)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Max Profit</p>
                        <p className="font-semibold text-lg text-green-400">{formatCurrency(trade.maxProfit)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Max Loss</p>
                        <p className="font-semibold text-lg text-red-400">{formatCurrency(trade.maxLoss)}</p>
                    </div>
                </div>
                
                {showExitButton && (
                    <div className="pt-2 border-t border-gray-600">
                        <button
                            onClick={handleExitClick}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Exit Trade
                        </button>
                    </div>
                )}
            </div>

            {/* Exit Trade Modal */}
            {showExitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Exit Trade: {trade.ticker} {trade.shortStrike}/{trade.longStrike}P
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Outcome</label>
                                <div className="flex space-x-4">
                                    <button 
                                        type="button" 
                                        onClick={() => handleStatusChange('profit')} 
                                        className={`flex-1 py-2 rounded-md transition-colors ${exitDetails.status === 'profit' ? 'bg-green-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
                                    >
                                        Profit
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleStatusChange('loss')} 
                                        className={`flex-1 py-2 rounded-md transition-colors ${exitDetails.status === 'loss' ? 'bg-red-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
                                    >
                                        Loss
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Final P/L
                                    <span className="text-xs text-gray-500 ml-2">
                                        (Enter positive amount - sign will be applied automatically)
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={exitDetails.finalPL}
                                        onChange={(e) => setExitDetails({...exitDetails, finalPL: e.target.value})}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter amount (e.g., 150.00)"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium">
                                        <span className={exitDetails.status === 'profit' ? 'text-green-400' : 'text-red-400'}>
                                            {exitDetails.status === 'profit' ? '+' : '-'}{formatCurrency(Math.abs(parseFloat(exitDetails.finalPL) || 0))}
                                        </span>
                                    </div>
                                </div>
                                {exitDetails.status === 'loss' && (
                                    <p className="text-xs text-red-400 mt-1">
                                        This will be recorded as a loss of {formatCurrency(Math.abs(parseFloat(exitDetails.finalPL) || 0))}
                                    </p>
                                )}
                                {exitDetails.status === 'profit' && (
                                    <p className="text-xs text-green-400 mt-1">
                                        This will be recorded as a profit of {formatCurrency(Math.abs(parseFloat(exitDetails.finalPL) || 0))}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Exit Date</label>
                                <input
                                    type="date"
                                    value={exitDetails.exitDate}
                                    onChange={(e) => setExitDetails({...exitDetails, exitDate: e.target.value})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => setShowExitModal(false)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExitSubmit}
                                    disabled={!exitDetails.finalPL}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Confirm Exit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TradeCard;
