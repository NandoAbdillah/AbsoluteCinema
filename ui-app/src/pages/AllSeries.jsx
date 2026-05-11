import  { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import MovieCard from '../components/MovieCard';

const AllSeries = () => {
  // Panggil openModal dari AppContext
  const { allMovies, openModal } = useContext(AppContext);

  // Optimasi filtering: Hanya ambil yang isFilm !== true dan sort rating
  const series = useMemo(() => {
    if (!allMovies || allMovies.length === 0) return [];
    return allMovies
      .filter(m => m.isFilm !== true)
      .sort((a, b) => b.rating - a.rating);
  }, [allMovies]);

  // Gunakan openModal dari Context saat kartu diklik
  const handleOpenDetail = (movieName) => {
    openModal(movieName);
  };

  return (
    <div className="pb-8">
      {/* Header Halaman */}
      <div className="flex items-center justify-between mb-[18px]">
        <div className="text-[18px] font-bold flex items-center gap-2">
          📺 Semua Series
        </div>
        <div className="text-[13px] text-[#8888aa] font-medium bg-[#1e1e2e] px-3 py-1 rounded-full border border-white/5">
          {series.length} Judul
        </div>
      </div>

      {/* Grid List Series */}
      {series.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[18px]">
          {series.map((item, idx) => (
            // Wrapper group untuk menambahkan info metadata tambahan pas dihover 
            // tanpa mengubah MovieCard component
            <div key={`series-${idx}`} className="relative group">
              <MovieCard 
                movie={item} 
                onClick={() => handleOpenDetail(item.nama)} 
              />
              
              {/* Overlay Metadata Tambahan (Season & Episode) */}
              <div className="absolute top-2 left-2 bg-[#0f0f17]/90 backdrop-blur-sm border border-[#7c6af7]/30 rounded-lg px-2 py-1 text-[10px] text-[#e8e8f0] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                {item.jumlahSeason ? `${item.jumlahSeason} Season` : '0 Season'}
                {item.jumlahEpisode ? ` • ${item.jumlahEpisode} Eps` : ''}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-8 text-[#8888aa]">
          <div className="text-5xl mb-4">📺</div>
          <h3 className="text-lg font-bold text-[#e8e8f0] mb-2">Belum ada series</h3>
          <p className="text-sm">Silakan tambahkan series lewat menu Admin.</p>
        </div>
      )}
    </div>
  );
};

export default AllSeries;