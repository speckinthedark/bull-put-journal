import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown, PlusCircle, BookOpen, LogOut, TrendingUp, TrendingDown, Calendar, DollarSign, Target, CheckCircle, Circle, AlertTriangle, Trash2, HelpCircle, ExternalLink, Save, Layout, Filter } from 'lucide-react';
import { calculateDTE } from '../utils/tradeCalculations';
import { entryChecklistItems, macroChecklistItems } from '../constants/checklists';

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input {...props} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

const Checklist = ({ title, items, checkedItems, onCheck, disabled, setCurrentView }) => {
    const handleHelpClick = (section) => {
        setCurrentView('documentation');
        // Small delay to ensure the view renders before scrolling
        setTimeout(() => {
            const element = document.getElementById(section);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <div className={`bg-gray-800 p-6 rounded-lg shadow-lg ${disabled ? 'opacity-50' : ''}`}>
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <div className="space-y-3">
                {Object.entries(items).map(([item, section]) => (
                    <div key={item} className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer flex-1">
                            <input type="checkbox" className="hidden" checked={!!checkedItems[item]} onChange={() => onCheck(item)} disabled={disabled} />
                            {checkedItems[item] ? <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" /> : <Circle className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                            <span className="ml-3 text-gray-300">{item}</span>
                        </label>
                        <button 
                            type="button"
                            onClick={() => handleHelpClick(section)}
                            className="text-blue-400 hover:text-blue-300 ml-2 flex-shrink-0"
                            title="Learn more about this requirement"
                        >
                            <HelpCircle className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- New Trade View Component ---
export const NewTradeView = ({ addTrade, setCurrentView, priceService, templateService }) => {
    const [trade, setTrade] = useState({
        ticker: '',
        entryDate: new Date().toISOString().slice(0, 10),
        expirationDate: '',
        shortStrike: '',
        longStrike: '',
        netCredit: '',
        contracts: '1', // Default to 1 contract
    });
    const [checklists, setChecklists] = useState({ macro: {}, entry: {} });

    const calculatedValues = useMemo(() => {
        const shortStrike = parseFloat(trade.shortStrike);
        const longStrike = parseFloat(trade.longStrike);
        const netCredit = parseFloat(trade.netCredit);
        const contracts = parseInt(trade.contracts, 10) || 0;

        if (isNaN(shortStrike) || isNaN(longStrike) || isNaN(netCredit) || isNaN(contracts) || shortStrike <= longStrike || netCredit <= 0 || contracts <= 0) {
            return { maxProfit: 0, maxLoss: 0, breakeven: 0 };
        }

        const spreadWidth = shortStrike - longStrike;
        const maxProfitPerContract = netCredit * 100;
        const maxLossPerContract = (spreadWidth * 100) - maxProfitPerContract;
        const breakeven = shortStrike - netCredit;

        return {
            maxProfit: maxProfitPerContract * contracts,
            maxLoss: maxLossPerContract * contracts,
            breakeven: breakeven,
        };
    }, [trade.shortStrike, trade.longStrike, trade.netCredit, trade.contracts]);

    const handleCheck = (list, item) => {
        setChecklists(prev => ({
            ...prev,
            [list]: { ...prev[list], [item]: !prev[list][item] }
        }));
    };

    const allChecked = useMemo(() => {
        const macroAllChecked = Object.keys(macroChecklistItems).every(item => checklists.macro[item]);
        const entryAllChecked = Object.keys(entryChecklistItems).every(item => checklists.entry[item]);
        return macroAllChecked && entryAllChecked;
    }, [checklists]);
    
    const isFormValid = useMemo(() => {
        return Object.values(trade).every(val => val !== '');
    }, [trade]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid || !allChecked) return;

        const spreadWidth = parseFloat(trade.shortStrike) - parseFloat(trade.longStrike);
        const numContracts = parseInt(trade.contracts, 10);

        addTrade({
            ...trade,
            shortStrike: parseFloat(trade.shortStrike),
            longStrike: parseFloat(trade.longStrike),
            netCredit: parseFloat(trade.netCredit),
            contracts: numContracts,
            spreadWidth,
            maxProfit: calculatedValues.maxProfit,
            maxLoss: calculatedValues.maxLoss,
            breakeven: calculatedValues.breakeven,
            status: 'ongoing',
            exitDate: null,
            finalPL: null,
        });
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Enter New Trade</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                    <h3 className="text-xl font-semibold mb-2">Trade Specifications</h3>
                    <InputField label="Ticker" name="ticker" value={trade.ticker} onChange={(e) => setTrade({...trade, ticker: e.target.value.toUpperCase()})} placeholder="e.g., SPY" />
                    <InputField label="Entry Date" name="entryDate" type="date" value={trade.entryDate} onChange={(e) => setTrade({...trade, entryDate: e.target.value})} />
                    <InputField label="Expiration Date" name="expirationDate" type="date" value={trade.expirationDate} onChange={(e) => setTrade({...trade, expirationDate: e.target.value})} />
                    <InputField label="Short Put Strike" name="shortStrike" type="number" value={trade.shortStrike} onChange={(e) => setTrade({...trade, shortStrike: e.target.value})} placeholder="e.g., 480" />
                    <InputField label="Long Put Strike" name="longStrike" type="number" value={trade.longStrike} onChange={(e) => setTrade({...trade, longStrike: e.target.value})} placeholder="e.g., 470" />
                    <InputField label="Net Credit" name="netCredit" type="number" step="0.01" value={trade.netCredit} onChange={(e) => setTrade({...trade, netCredit: e.target.value})} placeholder="e.g., 3.00" />
                    <InputField label="Number of Contracts" name="contracts" type="number" min="1" value={trade.contracts} onChange={(e) => setTrade({...trade, contracts: e.target.value})} placeholder="e.g., 1" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 bg-gray-700 rounded-lg text-center">
                            <p className="text-sm text-gray-400">Max Profit</p>
                            <p className="text-2xl font-bold text-green-400">${calculatedValues.maxProfit.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-gray-700 rounded-lg text-center">
                            <p className="text-sm text-gray-400">Max Loss</p>
                            <p className="text-2xl font-bold text-red-400">${calculatedValues.maxLoss.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Checklist title="Macro & Underlying Checklist" items={macroChecklistItems} checkedItems={checklists.macro} onCheck={(item) => handleCheck('macro', item)} disabled={!isFormValid} setCurrentView={setCurrentView} />
                    <Checklist title="Trade Entry Rules Checklist" items={entryChecklistItems} checkedItems={checklists.entry} onCheck={(item) => handleCheck('entry', item)} disabled={!isFormValid} setCurrentView={setCurrentView} />
                </div>
                
                <div className="lg:col-span-2">
                    <button
                        type="submit"
                        disabled={!allChecked || !isFormValid}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                        Add Trade
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Exit Trade View Component ---
export const ExitTradeView = ({ trades, updateTrade }) => {
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
};

// --- Delete Trade View Component ---
export const DeleteTradeView = ({ trades, deleteTrade }) => {
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
};

// --- Documentation View Component ---
export const DocumentationView = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Bull Put Spread Strategy Guide</h2>
            
            <div className="space-y-8">
                {/* Liquidity Section */}
                <section id="liquidity" className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">Options Liquidity Requirements</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>Before entering any bull put spread, ensure the underlying has excellent liquidity. Poor liquidity can cost you money through wide bid-ask spreads and difficulty exiting positions.</p>
                        
                        <div className="bg-gray-700 p-4 rounded">
                            <h4 className="font-semibold text-white mb-2">Key Liquidity Metrics:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>High Average Daily Options Volume:</strong> Look for hundreds of thousands, preferably millions of contracts traded daily</li>
                                <li><strong>Significant Open Interest:</strong> High open interest ensures deep pools of buyers and sellers</li>
                                <li><strong>Tight Bid-Ask Spreads:</strong> Spreads should be just a few pennies wide, not dollars</li>
                            </ul>
                        </div>
                        
                        <p><strong>Best Underlyings:</strong> SPY, QQQ, IWM are ideal. Avoid low-volume stocks that might have wide spreads or poor fill prices.</p>
                    </div>
                </section>

                {/* Earnings Risk Section */}
                <section id="earnings-risk" className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">Avoiding Earnings Risk</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>Never hold a bull put spread through an earnings announcement. Earnings create unpredictable volatility that can cause gap moves beyond your strikes.</p>
                        
                        <div className="bg-red-900/20 border border-red-500/20 p-4 rounded">
                            <h4 className="font-semibold text-red-400 mb-2">Why Earnings Are Dangerous:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Surprise earnings can cause overnight gaps that blow through your protection</li>
                                <li>Even good earnings can sometimes cause stock drops due to guidance or other factors</li>
                                <li>IV crush after earnings can help, but the gap risk isn't worth it</li>
                            </ul>
                        </div>
                        
                        <p><strong>Rule:</strong> If there's a scheduled earnings announcement before your 21 DTE management point, either skip the trade or choose a different expiration.</p>
                    </div>
                </section>

                {/* IV Percentile Section */}
                <section id="iv-percentile" className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">IV Percentile - Selling When Premium is Rich</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>IV Percentile (IVP) tells you how expensive options are relative to their historical range. We want to sell when options are expensive.</p>
                        
                        <div className="bg-gray-700 p-4 rounded">
                            <h4 className="font-semibold text-white mb-2">Understanding IVP:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>IVP &gt; 50:</strong> Current IV is higher than it's been on 50% of days in the past year</li>
                                <li><strong>IVP &gt; 70:</strong> Ideal entry zone - options are expensive</li>
                                <li><strong>IVP &lt; 30:</strong> Avoid selling spreads - options are cheap</li>
                            </ul>
                        </div>
                        
                        <p><strong>Strategy:</strong> Higher IVP means bigger credits for the same risk, and better chance IV will decrease (helping your position).</p>
                    </div>
                </section>

                {/* Economic Events Section */}
                <section id="economic-events" className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">Economic Event Risk</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>Major economic announcements can cause significant market moves. Avoid opening new positions 2-3 days before these events.</p>
                        
                        <div className="bg-yellow-900/20 border border-yellow-500/20 p-4 rounded">
                            <h4 className="font-semibold text-yellow-400 mb-2">High-Impact Events to Watch:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>FOMC Meetings:</strong> Fed interest rate decisions and policy statements</li>
                                <li><strong>CPI Reports:</strong> Monthly inflation data</li>
                                <li><strong>Jobs Reports:</strong> Monthly unemployment and payroll data</li>
                                <li><strong>GDP Reports:</strong> Quarterly economic growth data</li>
                            </ul>
                        </div>
                        
                        <p><strong>Timing:</strong> Either wait until after the event, or ensure your position has enough time to recover if there's an adverse move.</p>
                    </div>
                </section>

                {/* DTE Selection Section */}
                <section id="dte-selection" className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">The 30-45 DTE Sweet Spot</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>Days to Expiration (DTE) is crucial for balancing premium collection with time decay acceleration.</p>
                        
                        <div className="bg-gray-700 p-4 rounded">
                            <h4 className="font-semibold text-white mb-2">Why 30-45 DTE is Optimal:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Premium Collection:</strong> Enough time value to collect meaningful credit</li>
                                <li><strong>Theta Acceleration:</strong> Time decay starts accelerating meaningfully in this window</li>
                                <li><strong>Flexibility:</strong> Time to manage or adjust if the trade moves against you</li>
                                <li><strong>Avoid Gamma Risk:</strong> Staying away from the dangerous last 21 days</li>
                            </ul>
                        </div>
                        
                        <p><strong>Management:</strong> Plan to close or roll positions at 21 DTE to avoid accelerating gamma risk.</p>
                    </div>
                </section>

                {/* Technical Analysis Section */}
                <section id="technical-analysis" className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">Technical Analysis for Entry</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>Technical analysis helps identify areas where the stock is likely to find support, increasing your probability of success.</p>
                        
                        <div className="bg-gray-700 p-4 rounded">
                            <h4 className="font-semibold text-white mb-2">Key Support Levels to Identify:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Previous Lows:</strong> Price levels where buying pressure previously stepped in</li>
                                <li><strong>Moving Averages:</strong> 20-day, 50-day, 200-day SMAs often act as dynamic support</li>
                                <li><strong>Trendlines:</strong> Ascending trendlines connecting higher lows</li>
                                <li><strong>Round Numbers:</strong> Psychological levels like $450, $500, etc.</li>
                            </ul>
                        </div>
                        
                        <p><strong>Entry Rule:</strong> Only enter when the underlying is in a clear uptrend or stable consolidation. Avoid downtrending stocks.</p>
                    </div>
                </section>

                {/* Strike Selection Section */}
                <section id="strike-selection" className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">Strategic Strike Selection</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>Your strike selection determines both your probability of success and your risk/reward profile.</p>
                        
                        <div className="bg-gray-700 p-4 rounded">
                            <h4 className="font-semibold text-white mb-2">Strike Selection Rules:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Short Strike:</strong> Must be BELOW identified support level</li>
                                <li><strong>Technical Buffer:</strong> Don't sell strikes right at support - give yourself room</li>
                                <li><strong>Spread Width:</strong> Typically $5-$20 wide depending on underlying price</li>
                                <li><strong>Risk/Reward:</strong> Ensure max profit justifies max loss potential</li>
                            </ul>
                        </div>
                        
                        <p><strong>Buffer Zone:</strong> If support is at $480, consider selling the $475 put to give yourself a $5 buffer against technical breakdown.</p>
                    </div>
                </section>

                {/* Delta Selection Section */}
                <section id="delta-selection" className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">Delta as Probability Guide</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>Delta approximates the probability that an option will expire in-the-money. Use this to calibrate your risk.</p>
                        
                        <div className="bg-gray-700 p-4 rounded">
                            <h4 className="font-semibold text-white mb-2">Delta Guidelines:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>0.20-0.30 Delta:</strong> ~20-30% chance of finishing ITM (70-80% success rate)</li>
                                <li><strong>Higher Delta:</strong> More premium but higher probability of loss</li>
                                <li><strong>Lower Delta:</strong> Less premium but higher probability of success</li>
                                <li><strong>Sweet Spot:</strong> 0.25 delta offers good balance of premium and probability</li>
                            </ul>
                        </div>
                        
                        <p><strong>Position Sizing:</strong> Higher delta positions should be smaller size due to increased risk.</p>
                    </div>
                </section>

                {/* Risk Management Section */}
                <section id="risk-management" className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">Risk Management & Position Sizing</h3>
                    <div className="space-y-4 text-gray-300">
                        <p>Proper risk management is what separates profitable traders from those who blow up their accounts.</p>
                        
                        <div className="bg-gray-700 p-4 rounded">
                            <h4 className="font-semibold text-white mb-2">Risk Management Rules:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Position Size:</strong> Never risk more than 1-2% of account on single trade</li>
                                <li><strong>Max Loss Acceptance:</strong> Be comfortable losing the max loss before entry</li>
                                <li><strong>Stop Loss:</strong> Consider closing at 100-200% of credit received</li>
                                <li><strong>Profit Taking:</strong> Close at 50% of max profit for optimal risk/reward</li>
                            </ul>
                        </div>
                        
                        <div className="bg-green-900/20 border border-green-500/20 p-4 rounded">
                            <h4 className="font-semibold text-green-400 mb-2">The 50% Rule:</h4>
                            <p>Close winning trades when you've captured 50% of the maximum profit. This optimizes your return on capital and reduces time in the market.</p>
                        </div>
                        
                        <p><strong>Breakeven Analysis:</strong> Your breakeven should be well below identified support to provide a margin of safety.</p>
                    </div>
                </section>

                <div className="bg-blue-900/20 border border-blue-500/20 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Remember</h3>
                    <p className="text-gray-300">
                        This strategy is about collecting consistent income, not hitting home runs. Focus on high-probability setups, 
                        manage risk carefully, and let the law of large numbers work in your favor over many trades.
                    </p>
                </div>
            </div>
        </div>
    );
};
