/**
 * StarPicker — Click-to-rate star widget (1–5 stars).
 * Hover previews the rating. Click confirms it.
 */
import React, { useState } from 'react';
import { StarIcon } from './Icons';

interface StarPickerProps {
  value:    number;          // 0 = unset
  max?:     number;
  onChange: (rating: number) => void;
}

export const StarPicker: React.FC<StarPickerProps> = ({ value, max = 5, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="star-picker" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          className={`star-picker-btn ${display >= star ? 'star-picker-btn--filled' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star === value ? 0 : star)} // click again to clear
          title={`${star} / ${max}`}
        >
          <StarIcon size={22} />
        </button>
      ))}
      {value > 0 && (
        <span className="star-picker-label">{value} / {max}</span>
      )}
    </div>
  );
};
