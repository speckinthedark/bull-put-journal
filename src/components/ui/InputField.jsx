import React from 'react';

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input 
            {...props} 
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
    </div>
);

export default InputField;
