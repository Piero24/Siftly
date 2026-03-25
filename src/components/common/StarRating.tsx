/**
 * StarRating — Reusable numeric star rating display component.
 * Renders a value (e.g. 4.8) alongside a filled star icon from lucide-react.
 *
 * Usage:
 *   <StarRating value={4.8} />
 *   <StarRating value={3} max={5} />
 */
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  /** Rating value (e.g. 4.2) */
  value: number;
  /** Maximum rating (default: 5) */
  max?: number;
  /** Icon size in px (default: 12) */
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, max = 5, size = 12 }) => {
  const clamped = Math.min(Math.max(value, 0), max);

  return (
    <span className="star-rating" title={`${clamped} / ${max}`}>
      <span className="star-rating__value">{clamped.toFixed(1)}</span>
      <Star size={size} className="star-rating__icon" />
    </span>
  );
};
