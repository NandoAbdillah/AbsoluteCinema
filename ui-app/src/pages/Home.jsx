import { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import MovieCard from '../components/MovieCard';

const Home = () => {
  // Tambahan openModal di sini mas!
  const { allMovies, openModal } = useContext(AppContext);
  const navigate = useNavigate();

  // Optimasi filtering dan sorting menggunakan useMemo agar tidak render ulang berlebihan
  const { heroMovie, topFilms, topSeries } = useMemo(() => {
    if (!allMovies || allMovies.length === 0) {
      return { heroMovie: null, topFilms: [], topSeries: [] };
    }

    // Sort semua berdasarkan rating tertinggi
    const sortedByRating = [...allMovies].sort((a, b) => b.rating - a.rating);
    
    // Ambil 1 yang terbaik untuk Hero Section
    const hero = sortedByRating[0];
    
    // Pisahkan Top 8 Film dan Top 8 Series
    const films = sortedByRating.filter(m => m.isFilm === true).slice(0, 8);
    const series = sortedByRating.filter(m => m.isFilm !== true).slice(0, 8);

    return { heroMovie: hero, topFilms: films, topSeries: series };
  }, [allMovies]);

  // Nah ini yang tadinya console.log sekarang beneran buka modalnya
  const handleOpenDetail = (movieName) => {
    openModal(movieName);
  };

  // Empty State kalau C++ belum ada data sama sekali
  if (!allMovies || allMovies.length === 0) {
    return (
      <div className="text-center py-16 px-8 text-[#8888aa]">
        <div className="text-5xl mb-4">🎬</div>
        <h3 className="text-lg font-bold text-[#e8e8f0] mb-2">Belum ada film</h3>
        <p className="text-sm">Silakan tambahkan film lewat menu Admin.</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* HERO SECTION */}
      {heroMovie && (
        <div className="relative rounded-[20px] overflow-hidden h-[340px] mb-9 bg-gradient-to-br from-[#1a0533] via-[#0d1a4a] to-[#001a33]">
          {/* Background Poster (Blurry) */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-35 blur-[2px]"
            style={{ backgroundImage: `url('${heroMovie.poster}')` }}
          ></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f17fa] via-[#0f0f17b3] to-transparent"></div>
          
          {/* Hero Content */}
          <div className="relative z-10 px-12 py-10 h-full flex flex-col justify-end">
            <div className="inline-flex items-center gap-[6px] bg-[#7c6af733] border border-[#7c6af766] rounded-full px-3 py-1 text-[11px] text-[#a78bfa] uppercase tracking-[1px] mb-3 w-fit">
              ⭐ Film Terpopuler
            </div>
            
            <div className="text-[42px] font-black leading-[1.1] mb-2.5 text-shadow-[0_2px_20px_rgba(0,0,0,0.5)] max-w-[500px]">
              {heroMovie.nama}
            </div>
            
            <div className="flex items-center gap-4 mb-5 text-[13px] text-[#8888aa]">
              <div className="flex items-center gap-[6px] text-[#fbbf24] font-bold text-[15px]">
                ⭐ {heroMovie.rating?.toFixed(1)}
              </div>
              <span>{heroMovie.year || ""}</span>
              {heroMovie.genre?.map((g, idx) => (
                <span key={idx} className="bg-white/10 rounded-md px-2.5 py-[3px] text-[12px] text-[#8888aa]">
                  {g}
                </span>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => handleOpenDetail(heroMovie.nama)}
                className="flex items-center gap-2 bg-[#7c6af7] hover:bg-[#a78bfa] text-white border-none rounded-[10px] px-[22px] py-3 text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-[1px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                Detail
              </button>
              <button 
                onClick={() => handleOpenDetail(heroMovie.nama)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#e8e8f0] rounded-[10px] px-[22px] py-3 text-[14px] font-semibold cursor-pointer transition-all duration-200"
              >
                ⭐ Beri Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP FILMS SECTION */}
      {topFilms.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-[18px]">
            <div className="text-[18px] font-bold">🎬 Film Terbaru</div>
            <button 
              onClick={() => navigate('/films')}
              className="text-[13px] text-[#a78bfa] cursor-pointer opacity-80 hover:opacity-100 transition-opacity bg-transparent border-none"
            >
              Lihat Semua →
            </button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[18px]">
            {topFilms.map((movie, idx) => (
              <MovieCard 
                key={`film-${idx}`} 
                movie={movie} 
                onClick={() => handleOpenDetail(movie.nama)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* TOP SERIES SECTION */}
      {topSeries.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-[18px]">
            <div className="text-[18px] font-bold">📺 Series Populer</div>
            <button 
              onClick={() => navigate('/series')}
              className="text-[13px] text-[#a78bfa] cursor-pointer opacity-80 hover:opacity-100 transition-opacity bg-transparent border-none"
            >
              Lihat Semua →
            </button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[18px]">
            {topSeries.map((series, idx) => (
              <MovieCard 
                key={`series-${idx}`} 
                movie={series} 
                onClick={() => handleOpenDetail(series.nama)} 
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;