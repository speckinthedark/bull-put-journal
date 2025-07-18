// Utility functions for trade calculations and date operations

/**
 * Calculate Days to Expiration (DTE) from expiration date
 * @param {string} expirationDate - Date string in YYYY-MM-DD format
 * @returns {number|null} - Number of days to expiration, null if no date provided
 */
export const calculateDTE = (expirationDate) => {
    if (!expirationDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expirationDate + 'T00:00:00'); // Ensure correct date parsing
    const diffTime = expiry.getTime() - today.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Calculate trade metrics (max profit, max loss, breakeven)
 * @param {Object} tradeData - Trade data containing strikes, credit, contracts
 * @returns {Object} - Calculated metrics
 */
export const calculateTradeMetrics = (tradeData) => {
    const { shortStrike, longStrike, netCredit, contracts } = tradeData;
    const shortStrikeNum = parseFloat(shortStrike);
    const longStrikeNum = parseFloat(longStrike);
    const netCreditNum = parseFloat(netCredit);
    const contractsNum = parseInt(contracts, 10) || 0;

    if (isNaN(shortStrikeNum) || isNaN(longStrikeNum) || isNaN(netCreditNum) || isNaN(contractsNum) || 
        shortStrikeNum <= longStrikeNum || netCreditNum <= 0 || contractsNum <= 0) {
        return { maxProfit: 0, maxLoss: 0, breakeven: 0 };
    }

    const spreadWidth = shortStrikeNum - longStrikeNum;
    const maxProfitPerContract = netCreditNum * 100;
    const maxLossPerContract = (spreadWidth * 100) - maxProfitPerContract;
    const breakeven = shortStrikeNum - netCreditNum;

    return {
        maxProfit: maxProfitPerContract * contractsNum,
        maxLoss: maxLossPerContract * contractsNum,
        breakeven: breakeven,
    };
};

/**
 * Format currency values for display
 * @param {number} value - Numeric value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, decimals = 2) => {
    return `$${Math.abs(value).toFixed(decimals)}`;
};

/**
 * Determine if a trade is in gamma risk zone
 * @param {number} dte - Days to expiration
 * @returns {boolean} - True if in gamma risk zone (≤ 21 DTE)
 */
export const isGammaRisk = (dte) => {
    return dte !== null && dte <= 21;
};
