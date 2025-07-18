import React, { useState, useMemo } from 'react';
import PriceService from './services/priceService';
import TemplateService from './services/templateService';
import { useAuth } from './hooks/useAuth';
import { useTrades } from './hooks/useTrades';

// UI Components
import Sidebar from './components/ui/Sidebar';

// View Components
import OverviewView from './components/views/OverviewView';
import OngoingTradesView from './components/views/OngoingTradesView';

// Import existing components (to be refactored later)
import { NewTradeView, ExitTradeView, DeleteTradeView, DocumentationView } from './components/LegacyComponents';

export default function App() {
    const [currentView, setCurrentView] = useState('overview');
    
    // Custom hooks for data management
    const { userId, isAuthReady } = useAuth();
    const { trades, isLoading, addTrade, updateTrade, deleteTrade } = useTrades(userId, isAuthReady);

    // Initialize services
    const priceService = useMemo(() => new PriceService('E2XDV7Q58NWTY3KG'), []);
    const templateService = useMemo(() => new TemplateService(), []);

    const handleAddTrade = async (tradeData) => {
        try {
            await addTrade(tradeData);
            setCurrentView('ongoing');
        } catch (error) {
            console.error("Error adding trade:", error);
        }
    };

    const handleUpdateTrade = async (tradeId, updateData) => {
        try {
            await updateTrade(tradeId, updateData);
            setCurrentView('overview');
        } catch (error) {
            console.error("Error updating trade:", error);
        }
    };

    const handleDeleteTrade = async (tradeId) => {
        try {
            await deleteTrade(tradeId);
            setCurrentView('overview');
        } catch (error) {
            console.error("Error deleting trade:", error);
        }
    };

    const renderView = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        switch (currentView) {
            case 'newTrade':
                return (
                    <NewTradeView 
                        addTrade={handleAddTrade} 
                        setCurrentView={setCurrentView} 
                        priceService={priceService} 
                        templateService={templateService} 
                    />
                );
            case 'ongoing':
                return <OngoingTradesView trades={trades} updateTrade={handleUpdateTrade} />;
            case 'exitTrade':
                return <ExitTradeView trades={trades} updateTrade={handleUpdateTrade} />;
            case 'deleteTrade':
                return <DeleteTradeView trades={trades} deleteTrade={handleDeleteTrade} />;
            case 'documentation':
                return <DocumentationView />;
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
