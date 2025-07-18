import React from 'react';

export default function DocumentationView() {
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
}
