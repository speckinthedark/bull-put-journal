// Price Service for fetching real-time stock prices
class PriceService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.cache = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.requestQueue = new Map(); // Prevent duplicate requests
    }

    async getCurrentPrice(ticker) {
        // Check cache first
        const cached = this.cache.get(ticker);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
            return cached.price;
        }

        // Check if request is already in progress
        if (this.requestQueue.has(ticker)) {
            return this.requestQueue.get(ticker);
        }

        // Create new request promise
        const requestPromise = this.fetchPrice(ticker);
        this.requestQueue.set(ticker, requestPromise);

        try {
            const price = await requestPromise;
            this.requestQueue.delete(ticker);
            return price;
        } catch (error) {
            this.requestQueue.delete(ticker);
            throw error;
        }
    }

    async fetchPrice(ticker) {
        try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check for API errors
            if (data['Error Message']) {
                throw new Error(`API Error: ${data['Error Message']}`);
            }
            
            if (data['Note']) {
                throw new Error('API rate limit exceeded');
            }
            
            const quote = data['Global Quote'];
            if (!quote || !quote['05. price']) {
                throw new Error('Invalid response format');
            }
            
            const price = parseFloat(quote['05. price']);
            
            // Cache the result
            this.cache.set(ticker, {
                price: price,
                timestamp: Date.now(),
                change: parseFloat(quote['09. change']),
                changePercent: quote['10. change percent']
            });
            
            return price;
        } catch (error) {
            console.error(`Price fetch failed for ${ticker}:`, error);
            return null; // Graceful degradation
        }
    }

    // Get cached price info including change data
    getCachedPriceInfo(ticker) {
        const cached = this.cache.get(ticker);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
            return cached;
        }
        return null;
    }

    // Batch fetch multiple tickers (for efficiency)
    async getCurrentPrices(tickers) {
        const promises = tickers.map(ticker => this.getCurrentPrice(ticker));
        const results = await Promise.allSettled(promises);
        
        const prices = {};
        tickers.forEach((ticker, index) => {
            const result = results[index];
            prices[ticker] = result.status === 'fulfilled' ? result.value : null;
        });
        
        return prices;
    }

    // Clear cache (useful for testing or forced refresh)
    clearCache() {
        this.cache.clear();
    }
}

export default PriceService;
