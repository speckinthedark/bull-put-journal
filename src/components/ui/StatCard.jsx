import React from 'react';

const StatCard = ({ title, value, isPositive }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-3xl font-bold ${
            isPositive === true ? 'text-green-400' : 
            isPositive === false ? 'text-red-400' : 
            'text-white'
        }`}>
            {value}
        </p>
    </div>
);

export default StatCard;
