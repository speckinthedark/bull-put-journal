import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown, PlusCircle, BookOpen, LogOut, TrendingUp, TrendingDown, Calendar, DollarSign, Target, CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import { db, auth, appId, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from './firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, query } from 'firebase/firestore'; // Keep this one

// --- Helper Functions ---
const calculateDTE = (expirationDate) => {
    if (!expirationDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expirationDate + 'T00:00:00'); // Ensure correct date parsing
    const diffTime = expiry.getTime() - today.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// --- Checklists Data ---
const macroChecklistItems = [
    "High Average Daily Options Volume?",
    "Significant Open Interest?",
    "Tight Bid-Ask Spread (e.g., $0.01-$0.05)?",
    "No scheduled Earnings before 21 DTE?",
    "IV Percentile (IVP) above 50%?",
    "No major economic event in next 2-3 days (FOMC, CPI)?",
];

const entryChecklistItems = [
    "Expiration is 30-45 DTE?",
    "Underlying in clear uptrend or consolidation?",
    "Identified a strong support level below current price?",
    "Short put strike is BELOW the support level?",
    "Short put delta is between 0.20 and 0.30?",
    "Comfortable with the defined Max Loss?",
    "Breakeven point is well below support?",
];

// --- Main App Component ---
export default function App() {
    const [currentView, setCurrentView] = useState('overview');
    const [trades, setTrades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Error signing in:", error);
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!isAuthReady || !userId) {
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        const tradesCollectionPath = `/artifacts/${appId}/users/${userId}/trades`;
        const q = query(collection(db, tradesCollectionPath));

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
            const tradesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTrades(tradesData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching trades:", error);
            setIsLoading(false);
        });

        return () => unsubscribeFirestore();
    }, [isAuthReady, userId]);

    const addTrade = async (tradeData) => {
        if (!userId) {
            console.error("User not authenticated");
            return;
        }
        const tradesCollectionPath = `/artifacts/${appId}/users/${userId}/trades`;
        try {
            await addDoc(collection(db, tradesCollectionPath), { ...tradeData, userId });
            setCurrentView('ongoing');
        } catch (error) {
            console.error("Error adding trade:", error);
        }
    };

    const updateTrade = async (tradeId, updateData) => {
        if (!userId) {
            console.error("User not authenticated");
            return;
        }
        const tradeDocPath = `/artifacts/${appId}/users/${userId}/trades/${tradeId}`;
        try {
            await updateDoc(doc(db, tradeDocPath), updateData);
            setCurrentView('overview');
        } catch (error) {
            console.error("Error updating trade:", error);
        }
    };

    const renderView = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div></div>;
        }
        switch (currentView) {
            case 'newTrade':
                return <NewTradeView addTrade={addTrade} />;
            case 'ongoing':
                return <OngoingTradesView trades={trades} />;
            case 'exitTrade':
                return <ExitTradeView trades={trades} updateTrade={updateTrade} />;
            case 'overview':
            default:
                return <OverviewView trades={trades} />;
        }
    };

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen flex font-sans">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} userId={userId} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {renderView()}
            </main>
        </div>
    );
}

// --- Sidebar Component ---
const Sidebar = ({ currentView, setCurrentView, userId }) => {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'newTrade', label: 'New Trade', icon: PlusCircle },
        { id: 'ongoing', label: 'Ongoing Trades', icon: TrendingUp },
        { id: 'exitTrade', label: 'Exit a Trade', icon: LogOut },
    ];

    return (
        <nav className="w-16 sm:w-64 bg-gray-900 border-r border-gray-700 p-2 sm:p-4 flex flex-col justify-between">
            <div>
                <div className="flex items-center mb-10 sm:mb-12">
                     <Target className="h-8 w-8 text-blue-400" />
                     <h1 className="hidden sm:block text-xl font-bold ml-3">TradeJournal</h1>
                </div>
                <ul>
                    {navItems.map(item => (
                        <li key={item.id} className="mb-2">
                            <button
                                onClick={() => setCurrentView(item.id)}
                                className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                                    currentView === item.id 
                                    ? 'bg-blue-600 text-white' 
                                    : 'hover:bg-gray-700 text-gray-300'
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="hidden sm:inline ml-4 font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="hidden sm:block p-2 border-t border-gray-700">
                <p className="text-xs text-gray-500">User ID:</p>
                <p className="text-xs text-gray-400 break-words">{userId || 'Authenticating...'}</p>
            </div>
        </nav>
    );
};

// --- Overview View Component ---
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
                                    <th className="p-2">Exit Date</th>
                                    <th className="p-2">Outcome</th>
                                    <th className="p-2 text-right">P/L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTrades.length > 0 ? filteredTrades.map(trade => (
                                    <tr key={trade.id} className="border-b border-gray-700">
                                        <td className="p-2 font-mono">{trade.ticker}</td>
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
                                        <td colSpan="4" className="text-center p-4 text-gray-500">No trades to display.</td>
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

const StatCard = ({ title, value, isPositive }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-3xl font-bold ${isPositive === true ? 'text-green-400' : isPositive === false ? 'text-red-400' : 'text-white'}`}>
            {value}
        </p>
    </div>
);

// --- New Trade View Component ---
const NewTradeView = ({ addTrade }) => {
    const [trade, setTrade] = useState({
        ticker: '',
        entryDate: new Date().toISOString().slice(0, 10),
        expirationDate: '',
        shortStrike: '',
        longStrike: '',
        netCredit: '',
    });
    const [checklists, setChecklists] = useState({ macro: {}, entry: {} });

    const handleCheck = (list, item) => {
        setChecklists(prev => ({
            ...prev,
            [list]: { ...prev[list], [item]: !prev[list][item] }
        }));
    };

    const allChecked = useMemo(() => {
        const macroAllChecked = macroChecklistItems.every(item => checklists.macro[item]);
        const entryAllChecked = entryChecklistItems.every(item => checklists.entry[item]);
        return macroAllChecked && entryAllChecked;
    }, [checklists]);
    
    const isFormValid = useMemo(() => {
        return Object.values(trade).every(val => val !== '');
    }, [trade]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid || !allChecked) return;

        const spreadWidth = parseFloat(trade.shortStrike) - parseFloat(trade.longStrike);
        const maxProfit = parseFloat(trade.netCredit) * 100;
        const maxLoss = (spreadWidth * 100) - maxProfit;
        const breakeven = parseFloat(trade.shortStrike) - parseFloat(trade.netCredit);

        addTrade({
            ...trade,
            shortStrike: parseFloat(trade.shortStrike),
            longStrike: parseFloat(trade.longStrike),
            netCredit: parseFloat(trade.netCredit),
            spreadWidth,
            maxProfit,
            maxLoss,
            breakeven,
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
                </div>

                <div className="space-y-6">
                    <Checklist title="Macro & Underlying Checklist" items={macroChecklistItems} checkedItems={checklists.macro} onCheck={(item) => handleCheck('macro', item)} disabled={!isFormValid} />
                    <Checklist title="Trade Entry Rules Checklist" items={entryChecklistItems} checkedItems={checklists.entry} onCheck={(item) => handleCheck('entry', item)} disabled={!isFormValid} />
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

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input {...props} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

const Checklist = ({ title, items, checkedItems, onCheck, disabled }) => (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-lg ${disabled ? 'opacity-50' : ''}`}>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
            {items.map(item => (
                <label key={item} className="flex items-center cursor-pointer">
                    <input type="checkbox" className="hidden" checked={!!checkedItems[item]} onChange={() => onCheck(item)} disabled={disabled} />
                    {checkedItems[item] ? <CheckCircle className="h-5 w-5 text-green-400" /> : <Circle className="h-5 w-5 text-gray-500" />}
                    <span className="ml-3 text-gray-300">{item}</span>
                </label>
            ))}
        </div>
    </div>
);


// --- Ongoing Trades View Component ---
const OngoingTradesView = ({ trades }) => {
    const ongoingTrades = trades.filter(t => t.status === 'ongoing');

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Ongoing Trades</h2>
            {ongoingTrades.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ongoingTrades.map(trade => <TradeCard key={trade.id} trade={trade} />)}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">No ongoing trades. Time to find a new setup!</p>
                </div>
            )}
        </div>
    );
};

const TradeCard = ({ trade }) => {
    const dte = calculateDTE(trade.expirationDate);
    const isGammaRisk = dte !== null && dte <= 21;

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-4">
            <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold font-mono">{trade.ticker}</h3>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${isGammaRisk ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-300'}`}>
                    {isGammaRisk && <AlertTriangle className="h-4 w-4 mr-2" />}
                    {dte} DTE
                </div>
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
                    <p className="font-semibold text-lg">${trade.breakeven.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Max Profit</p>
                    <p className="font-semibold text-lg text-green-400">${trade.maxProfit.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Max Loss</p>
                    <p className="font-semibold text-lg text-red-400">${trade.maxLoss.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

// --- Exit Trade View Component ---
const ExitTradeView = ({ trades, updateTrade }) => {
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
