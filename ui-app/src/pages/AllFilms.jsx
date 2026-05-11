import { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import MovieCard from '../components/MovieCard';

const AllFilms = () => {
  const { allMovies, openModal } = useContext(AppContext);

  // Optimasi filtering: Hanya ambil yang isFilm === true dan sort rating dari tinggi ke rendah
  const films = useMemo(() => {
    if (!allMovies || allMovies.length === 0) return [];
    return allMovies
      .filter(m => m.isFilm === true)
      .sort((a, b) => b.rating - a.rating);
  }, [allMovies]);

  // Fungsi sementara untuk handle klik detail
  const handleOpenDetail = (movieName) => {
    openModal(movieName);
  };

  return (
    <div className="pb-8">
      {/* Header Halaman */}
      <div className="flex items-center justify-between mb-[18px]">
        <div className="text-[18px] font-bold flex items-center gap-2">
          🎬 Semua Film
        </div>
        <div className="text-[13px] text-[#8888aa] font-medium bg-[#1e1e2e] px-3 py-1 rounded-full border border-white/5">
          {films.length} Judul
        </div>
      </div>

      {/* Grid List Film */}
      {films.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[18px]">
          {films.map((movie, idx) => (
            <MovieCard 
              key={`film-${idx}`} 
              movie={movie} 
              onClick={() => handleOpenDetail(movie.nama)} 
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-8 text-[#8888aa]">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-lg font-bold text-[#e8e8f0] mb-2">Belum ada film</h3>
          <p className="text-sm">Silakan tambahkan film lewat menu Admin.</p>
        </div>
      )}
    </div>
  );
};

export default AllFilms;