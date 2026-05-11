import  { useState } from 'react';

const StarPicker = ({ currentRating, onRate, disabled, isSubmitting }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(10)].map((_, i) => {
        const starVal = i + 1;
        // Bintang akan menyala (lit) jika sedang dihover ATAU jika nilainya <= rating saat ini (saat tidak ada hover)
        const isLit = hoverRating ? starVal <= hoverRating : starVal <= currentRating;
        
        return (
          <button
            key={starVal}
            disabled={disabled || isSubmitting}
            onMouseEnter={() => !disabled && !isSubmitting && setHoverRating(starVal)}
            onMouseLeave={() => !disabled && !isSubmitting && setHoverRating(0)}
            onClick={() => !disabled && !isSubmitting && onRate(starVal)}
            className={`text-[28px] transition-transform duration-100 outline-none border-none bg-transparent select-none
              ${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.15]'}
              ${isLit ? 'text-[#fbbf24]' : 'text-[#252535]'}
            `}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default StarPicker;