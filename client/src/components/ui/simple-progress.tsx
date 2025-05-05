import React from 'react';

interface SimpleProgressProps {
  value: number;
  maxValue: number;
  colorClass?: string; // Keeping for backward compatibility, but not using it
}

export function SimpleProgress({ value, maxValue }: SimpleProgressProps) {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 rounded-full" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
