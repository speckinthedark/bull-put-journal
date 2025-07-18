// Trade entry and risk management checklists
export const macroChecklistItems = {
    "High Average Daily Options Volume?": "liquidity",
    "Significant Open Interest?": "liquidity", 
    "Tight Bid-Ask Spread (e.g., $0.01-$0.05)?": "liquidity",
    "No scheduled Earnings before 21 DTE?": "earnings-risk",
    "IV Percentile (IVP) above 50%?": "iv-percentile",
    "No major economic event in next 2-3 days (FOMC, CPI)?": "economic-events",
};

export const entryChecklistItems = {
    "Expiration is 30-45 DTE?": "dte-selection",
    "Underlying in clear uptrend or consolidation?": "technical-analysis",
    "Identified a strong support level below current price?": "technical-analysis",
    "Short put strike is BELOW the support level?": "strike-selection",
    "Short put delta is between 0.20 and 0.30?": "delta-selection",
    "Comfortable with the defined Max Loss?": "risk-management",
    "Breakeven point is well below support?": "risk-management",
};
