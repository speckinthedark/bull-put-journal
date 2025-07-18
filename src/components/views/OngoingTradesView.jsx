import React from 'react';
import { Calendar } from 'lucide-react';
import TradeCard from '../ui/TradeCard';
import { calculateDTE } from '../../utils/tradeCalculations';

const OngoingTradesView = ({ trades, updateTrade }) => {
    const ongoingTrades = trades
        .filter(t => t.status === 'ongoing')
        .sort((a, b) => {
            // Sort by DTE ascending (closest to expiry first)
            const dteA = calculateDTE(a.expirationDate) || 999;
            const dteB = calculateDTE(b.expirationDate) || 999;
            return dteA - dteB;
        });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Ongoing Trades</h2>
                {ongoingTrades.length > 0 && (
                    <div className="text-sm text-gray-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Sorted by expiration (closest first)
                    </div>
                )}
            </div>
            {ongoingTrades.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ongoingTrades.map(trade => 
                        <TradeCard 
                            key={trade.id} 
                            trade={trade} 
                            updateTrade={updateTrade}
                            showExitButton={true}
                        />
                    )}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">No ongoing trades. Time to find a new setup!</p>
                </div>
            )}
        </div>
    );
};

export default OngoingTradesView;
