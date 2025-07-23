import React from 'react';

const Input = React.forwardRef(({ 
    label,
    error,
    className = '',
    ...props 
}, ref) => {
    const inputClasses = `
        w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
        ${error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
        }
        ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        ${className}
    `;

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={inputClasses}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input; 