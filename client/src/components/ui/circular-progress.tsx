import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: React.ReactNode;
  color?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 'md',
  showLabel = true,
  label,
  color = 'bg-primary',
  className,
}: CircularProgressProps) {
  const sizes = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const fontSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const strokeWidth = {
    sm: 4,
    md: 6,
    lg: 8,
  };

  const radius = {
    sm: 30,
    md: 45,
    lg: 60,
  };

  const sizeKey = size as keyof typeof sizes;
  const circumference = 2 * Math.PI * radius[sizeKey];
  const progressValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (progressValue / 100) * circumference;
  
  // Dynamic color classes based on the color prop
  const colorMap: Record<string, string> = {
    'bg-primary': 'stroke-primary',
    'bg-secondary': 'stroke-secondary',
    'bg-accent': 'stroke-accent',
    'bg-error': 'stroke-destructive',
    'bg-success': 'stroke-success',
  };
  
  const strokeColor = colorMap[color] || 'stroke-primary';

  return (
    <div className={cn('relative flex items-center justify-center', sizes[sizeKey], className)}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${radius[sizeKey] * 2 + strokeWidth[sizeKey]} ${radius[sizeKey] * 2 + strokeWidth[sizeKey]}`}>
        <circle
          cx={radius[sizeKey] + strokeWidth[sizeKey] / 2}
          cy={radius[sizeKey] + strokeWidth[sizeKey] / 2}
          r={radius[sizeKey]}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth[sizeKey]}
          className="stroke-muted opacity-25"
        />
        <circle
          cx={radius[sizeKey] + strokeWidth[sizeKey] / 2}
          cy={radius[sizeKey] + strokeWidth[sizeKey] / 2}
          r={radius[sizeKey]}
          fill="transparent"
          strokeWidth={strokeWidth[sizeKey]}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={strokeColor}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          {label || <span className={cn('font-headings font-semibold', fontSizes[sizeKey])}>{progressValue}</span>}
        </div>
      )}
    </div>
  );
}
