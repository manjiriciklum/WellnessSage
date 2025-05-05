import React from 'react';
import { cn } from '@/lib/utils';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  value: number | null;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showValue?: boolean;
  reviewCount?: number | null;
}

export function StarRating({
  value,
  max = 5,
  size = 'sm',
  className,
  showValue = false,
  reviewCount,
}: StarRatingProps) {
  // Handle null value
  const safeValue = value ?? 0;
  
  // Calculate whole stars, half stars, and empty stars
  const filledStars = Math.floor(safeValue);
  const hasHalfStar = safeValue % 1 >= 0.5;
  const emptyStars = max - filledStars - (hasHalfStar ? 1 : 0);

  const sizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const sizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex text-warning">
        {/* Filled stars */}
        {Array.from({ length: filledStars }).map((_, index) => (
          <Star key={`filled-${index}`} fill="currentColor" size={sizes[size]} />
        ))}

        {/* Half star */}
        {hasHalfStar && <StarHalf fill="currentColor" size={sizes[size]} />}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star key={`empty-${index}`} size={sizes[size]} />
        ))}
      </div>

      {showValue && (
        <span className={cn('ml-1 text-neutral-500 dark:text-neutral-300', sizeClass[size])}>
          {value.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount} reviews)`}
        </span>
      )}
    </div>
  );
}
