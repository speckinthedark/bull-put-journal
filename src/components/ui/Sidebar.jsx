import React from 'react';
import { BookOpen, PlusCircle, TrendingUp, Trash2, HelpCircle, Target, DollarSign, BarChart3 } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, userId }) => {
    const navItems = [
        { id: 'account-overview', label: 'Account Overview', icon: DollarSign },
        { id: 'trade-performance', label: 'Trade Performance', icon: BarChart3 },
        { id: 'newTrade', label: 'New Trade', icon: PlusCircle },
        { id: 'ongoing', label: 'Ongoing Trades', icon: TrendingUp },
        { id: 'deleteTrade', label: 'Delete a Trade', icon: Trash2 },
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
                
                <hr className="my-4 border-gray-700" />
                
                <ul>
                    <li className="mb-2">
                        <button
                            onClick={() => setCurrentView('documentation')}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                                currentView === 'documentation'
                                ? 'bg-blue-600 text-white' 
                                : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        >
                            <HelpCircle className="h-5 w-5" />
                            <span className="hidden sm:inline ml-4 font-medium">Strategy Guide</span>
                        </button>
                    </li>
                </ul>
            </div>
            <div className="hidden sm:block p-2 border-t border-gray-700">
                <p className="text-xs text-gray-500">User ID:</p>
                <p className="text-xs text-gray-400 break-words">{userId || 'Authenticating...'}</p>
            </div>
        </nav>
    );
};

export default Sidebar;
