import { useState } from 'react';

const MovieCard = ({ movie, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const badgeStyle = movie.isFilm 
    ? 'bg-[#2dd4bf26] text-[#2dd4bf]' 
    : 'bg-[#7c6af726] text-[#a78bfa]';
    
  const badgeText = movie.isFilm ? 'Film' : 'Series';

  return (
    <div 
      className="bg-[#16161f] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 border border-white/5 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:border-[#7c6af74d]"
      onClick={onClick}
    >
      <div className="w-full aspect-[2/3] bg-[#1e1e2e] relative flex items-center justify-center">
        {movie.poster && !imageError ? (
          <img 
            src={movie.poster} 
            alt={movie.nama}
            className="w-full h-full object-cover block"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e2e] to-[#252535] flex items-center justify-center text-[40px]">
            🎬
          </div>
        )}
      </div>

      <div className="p-3">
        <div 
          className="text-[13px] font-semibold mb-[6px] whitespace-nowrap overflow-hidden text-ellipsis"
          title={movie.nama}
        >
          {movie.nama}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[12px] font-bold text-[#fbbf24]">
            ⭐ {movie.rating?.toFixed(1) || '0.0'}
          </span>
          <span className={`text-[10px] px-[7px] py-[2px] rounded uppercase font-semibold ${badgeStyle}`}>
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;