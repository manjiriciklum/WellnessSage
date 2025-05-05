import React from 'react';

interface SimpleProgressProps {
  value: number;
  maxValue: number;
  colorClass?: string;
}

export function SimpleProgress({ value, maxValue, colorClass = 'bg-primary' }: SimpleProgressProps) {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} rounded-full`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
