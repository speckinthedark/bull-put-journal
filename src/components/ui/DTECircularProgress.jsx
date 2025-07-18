import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DTECircularProgress = ({ dte, isGammaRisk }) => {
    // Calculate progress based on assumption that typical trades are 30-45 DTE
    // Progress decreases as time passes (fewer days remaining = more progress)
    const maxDTE = 45; // Maximum expected DTE for new trades
    const progress = dte !== null ? Math.max(0, Math.min(100, ((maxDTE - dte) / maxDTE) * 100)) : 0;
    
    // Circle parameters
    const size = 60;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    // Color based on risk level
    const getColor = () => {
        if (dte === null) return '#6B7280'; // gray-500
        if (isGammaRisk) return '#F59E0B'; // yellow-500 (gamma risk)
        if (dte <= 30) return '#EF4444'; // red-500 (high time decay)
        if (dte <= 35) return '#F97316'; // orange-500 (medium time decay)
        return '#10B981'; // green-500 (low time decay)
    };

    const getTooltipText = () => {
        if (dte === null) return 'No expiration date set';
        if (isGammaRisk) return `⚠️ Gamma risk zone! ${dte} days until expiration - consider closing`;
        if (dte <= 30) return `High time decay: ${dte} days remaining`;
        if (dte <= 35) return `Moderate time decay: ${dte} days remaining`;
        return `Low time decay: ${dte} days remaining`;
    };

    return (
        <div className="relative flex items-center justify-center group">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#374151"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-in-out"
                />
            </svg>
            {/* DTE text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xs font-bold ${isGammaRisk ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {dte || 0}
                </span>
                <span className={`text-xs ${isGammaRisk ? 'text-yellow-400' : 'text-gray-500'}`}>
                    DTE
                </span>
                {isGammaRisk && (
                    <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5" />
                )}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {getTooltipText()}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    );
};

export default DTECircularProgress;
