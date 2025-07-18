# Phase 1 & 2 Implementation Guide

## ✅ Services Created

### 1. Price Service (`src/services/priceService.js`)
- Alpha Vantage integration with caching
- Rate limiting protection
- Graceful error handling
- Batch price fetching capability

### 2. Template Service (`src/services/templateService.js`)
- Trade template management
- Default templates (SPY, QQQ, IWM setups)
- Custom template creation
- localStorage persistence

## 🔄 Manual Implementation Steps

### Step 1: Add Your API Key
Replace `REPLACE_WITH_YOUR_ALPHA_VANTAGE_API_KEY` in `src/App.jsx` line 48 with your actual Alpha Vantage API key.

### Step 2: Phase 1 Features to Implement

#### A. Trade Notes (High Priority)
Add to the trade data model:
```javascript
// In NewTradeView component, add notes field to trade state:
notes: '', // Add this to the trade useState

// Add to the form in NewTradeView:
<div>
    <label className="block text-sm font-medium text-gray-300 mb-2">Trade Notes (Optional)</label>
    <textarea
        value={trade.notes}
        onChange={(e) => setTrade(prev => ({ ...prev, notes: e.target.value }))}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24 resize-none"
        placeholder="Market conditions, reasoning, observations..."
    />
</div>
```

#### B. Auto-save Drafts (High Priority)
Add to NewTradeView component:
```javascript
// Auto-save functionality
const DRAFT_KEY = 'tradeDraft';

useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
        try {
            const draft = JSON.parse(savedDraft);
            setTrade(draft.trade || trade);
            setChecklists(draft.checklists || { macro: {}, entry: {} });
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }
}, []);

useEffect(() => {
    const saveDraft = () => {
        const draft = { trade, checklists, timestamp: Date.now() };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    };
    
    const timeoutId = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timeoutId);
}, [trade, checklists]);
```

#### C. Trade Templates (High Priority)
Add template selection UI above the form in NewTradeView:
```javascript
const [templates, setTemplates] = useState(templateService.getAllTemplates());
const [selectedTemplate, setSelectedTemplate] = useState('');

const handleApplyTemplate = (templateId) => {
    const templateData = templateService.applyTemplate(templateId, currentPrice);
    if (templateData) {
        setTrade(prev => ({ ...prev, ...templateData }));
        setSelectedTemplate(templateId);
    }
};

// Add this UI before the form:
<div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
    <h3 className="text-xl font-semibold text-white mb-4">Quick Start Templates</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map(template => (
            <button
                key={template.id}
                onClick={() => handleApplyTemplate(template.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedTemplate === template.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
            >
                <div className="text-left">
                    <h4 className="font-semibold text-white">{template.name}</h4>
                    <p className="text-sm text-gray-400">{template.description}</p>
                </div>
            </button>
        ))}
    </div>
</div>
```

### Step 3: Phase 2 Features to Implement

#### A. Current Price Display (High Priority)
Add to NewTradeView:
```javascript
const [currentPrice, setCurrentPrice] = useState(null);
const [priceLoading, setPriceLoading] = useState(false);

useEffect(() => {
    if (trade.ticker && trade.ticker.length >= 2) {
        setPriceLoading(true);
        priceService.getCurrentPrice(trade.ticker.toUpperCase())
            .then(price => {
                setCurrentPrice(price);
                setPriceLoading(false);
            })
            .catch(() => {
                setCurrentPrice(null);
                setPriceLoading(false);
            });
    } else {
        setCurrentPrice(null);
    }
}, [trade.ticker, priceService]);

// Update ticker input label:
<label className="block text-sm font-medium text-gray-300 mb-2">
    Ticker Symbol
    {currentPrice && (
        <span className="ml-2 text-green-400">
            ${currentPrice.toFixed(2)}
        </span>
    )}
    {priceLoading && (
        <span className="ml-2 text-gray-400">Loading...</span>
    )}
</label>
```

#### B. Enhanced Trade Cards with Price Context
Update the TradeCard component in OngoingTradesView:
```javascript
const TradeCard = ({ trade, priceService }) => {
    const [currentPrice, setCurrentPrice] = useState(null);
    const dte = calculateDTE(trade.expirationDate);
    const isGammaRisk = dte !== null && dte <= 21;

    useEffect(() => {
        priceService.getCurrentPrice(trade.ticker)
            .then(price => setCurrentPrice(price))
            .catch(() => setCurrentPrice(null));
    }, [trade.ticker, priceService]);

    const getRiskLevel = () => {
        if (!currentPrice) return 'unknown';
        const distanceToShort = currentPrice - trade.shortStrike;
        const buffer = distanceToShort / trade.shortStrike;
        
        if (buffer > 0.05) return 'safe';
        if (buffer > 0.02) return 'caution';
        return 'danger';
    };

    // Add current price and risk indicator to the card display
};
```

#### C. Monthly Comparison Charts
Add to OverviewView:
```javascript
// Calculate monthly data
const monthlyData = useMemo(() => {
    const monthlyStats = {};
    
    closedTrades.forEach(trade => {
        const month = trade.exitDate.substring(0, 7); // YYYY-MM
        if (!monthlyStats[month]) {
            monthlyStats[month] = { month, profit: 0, loss: 0, total: 0 };
        }
        
        if (trade.status === 'profit') {
            monthlyStats[month].profit += trade.finalPL;
        } else {
            monthlyStats[month].loss += Math.abs(trade.finalPL);
        }
        monthlyStats[month].total += trade.finalPL;
    });
    
    return Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month));
}, [closedTrades]);

// Add chart component
<ResponsiveContainer width="100%" height={300}>
    <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#8884d8" />
    </BarChart>
</ResponsiveContainer>
```

#### D. Advanced Filters
Add filter state and UI to OverviewView:
```javascript
const [filters, setFilters] = useState({
    ticker: '',
    startDate: '',
    endDate: '',
    status: 'all',
    minPL: '',
    maxPL: ''
});

// Add filter UI above the trades table
const filteredTrades = trades.filter(trade => {
    if (filters.ticker && !trade.ticker.toLowerCase().includes(filters.ticker.toLowerCase())) return false;
    if (filters.status !== 'all' && trade.status !== filters.status) return false;
    // Add more filter logic
    return true;
});
```

## 🚀 Quick Start Instructions

1. **Replace API Key**: Update line 48 in `src/App.jsx`
2. **Add Trade Notes**: Implement the notes field in NewTradeView
3. **Test Templates**: The template service should work immediately
4. **Add Auto-save**: Implement the localStorage draft functionality
5. **Add Current Prices**: Integrate price service with forms and cards

## 📊 Expected Results

After implementation:
- ✅ Trade templates for quick entry
- ✅ Auto-saving drafts prevent data loss
- ✅ Trade notes for learning documentation
- ✅ Real-time price display
- ✅ Enhanced trade cards with risk indicators
- ✅ Monthly performance comparisons
- ✅ Advanced filtering capabilities

## 🔧 Testing Checklist

1. Enter a few characters in ticker field → Should show loading then price
2. Fill out trade form → Should auto-save draft
3. Refresh page → Should restore draft
4. Click template → Should populate form
5. Submit trade → Should clear draft
6. View ongoing trades → Should show risk indicators
7. Check overview → Should show monthly charts

This provides a solid foundation for Phase 1 and Phase 2 features!
