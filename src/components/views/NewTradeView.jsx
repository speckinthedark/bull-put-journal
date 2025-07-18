import React, { useState, useMemo } from 'react';
import { CheckCircle, Circle, HelpCircle, CheckSquare, Square } from 'lucide-react';
import { entryChecklistItems, macroChecklistItems } from '../../constants/checklists';
import InputField from '../ui/InputField';

const Checklist = ({ title, items, checkedItems, onCheck, onSelectAll, disabled, setCurrentView }) => {
    const allSelected = Object.keys(items).every(item => checkedItems[item]);
    const someSelected = Object.keys(items).some(item => checkedItems[item]);

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
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{title}</h3>
                <button
                    type="button"
                    onClick={() => onSelectAll()}
                    disabled={disabled}
                    className={`flex items-center space-x-2 px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                        disabled 
                            ? 'cursor-not-allowed text-gray-500' 
                            : allSelected 
                                ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-900/20' 
                                : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'
                    }`}
                    title={allSelected ? "Deselect all items" : "Select all items"}
                >
                    {allSelected ? (
                        <CheckSquare className="h-4 w-4" />
                    ) : (
                        <Square className="h-4 w-4" />
                    )}
                    <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
                </button>
            </div>
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

export default function NewTradeView({ addTrade, setCurrentView, priceService, templateService }) {
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

    const handleSelectAll = (list, items) => {
        const allSelected = Object.keys(items).every(item => checklists[list][item]);
        const newState = {};
        Object.keys(items).forEach(item => {
            newState[item] = !allSelected;
        });
        setChecklists(prev => ({
            ...prev,
            [list]: newState
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
                    <Checklist 
                        title="Macro & Underlying Checklist" 
                        items={macroChecklistItems} 
                        checkedItems={checklists.macro} 
                        onCheck={(item) => handleCheck('macro', item)} 
                        onSelectAll={() => handleSelectAll('macro', macroChecklistItems)}
                        disabled={!isFormValid} 
                        setCurrentView={setCurrentView} 
                    />
                    <Checklist 
                        title="Trade Entry Rules Checklist" 
                        items={entryChecklistItems} 
                        checkedItems={checklists.entry} 
                        onCheck={(item) => handleCheck('entry', item)} 
                        onSelectAll={() => handleSelectAll('entry', entryChecklistItems)}
                        disabled={!isFormValid} 
                        setCurrentView={setCurrentView} 
                    />
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
}
