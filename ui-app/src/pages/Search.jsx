import  { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import MovieCard from '../components/MovieCard';

const Search = () => {
  const { allMovies, openModal } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Hook global buat nangkep input dari Topbar.jsx jika user ngetik di sana
  useEffect(() => {
    window.quickSearch = (val) => {
      setQuery(val);
    };
    return () => {
      delete window.quickSearch;
    };
  }, []);

  // Logika Debounce 200ms persis kayak di HTML lama biar nggak berat pas ngetik
  useEffect(() => {
    // Avoid calling setState synchronously inside the effect by scheduling
    // the "start searching" state change on the next macrotask.
    const startTimer = setTimeout(() => setIsSearching(true), 0);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 200);

    // Cleanup timeouts kalau user ngetik lagi sebelum 200ms
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [query]);

  // Proses filter & sorting hasil pencarian
  const searchResults = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return []; // Kosongkan kalau input kosong

    const filtered = allMovies.filter((m) => {
      const matchTitle = m.nama?.toLowerCase().includes(q);
      const matchGenre = m.genre?.some((g) => g.toLowerCase().includes(q));
      const matchStudio = m.studio?.toLowerCase().includes(q);
      const matchOverview = m.overview?.toLowerCase().includes(q);
      
      return matchTitle || matchGenre || matchStudio || matchOverview;
    });

    // Urutkan berdasarkan rating tertinggi (relevansi tambahan bisa dikembangkan nanti)
    return filtered.sort((a, b) => b.rating - a.rating);
  }, [debouncedQuery, allMovies]);

  const handleOpenDetail = (movieName) => {
    console.log("Buka detail untuk:", movieName);
    openModal(movieName);
  };

  return (
    <div className="pb-8">
      {/* Kotak Pencarian Utama (Sync dengan Topbar) */}
      <div className="mb-[18px]">
        <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">
          Cari Film / Series
        </label>
        <div className="flex items-center gap-[10px] bg-[#1e1e2e] border border-white/10 rounded-[10px] px-[14px] py-[12px] w-full max-w-[500px] focus-within:border-[#7c6af7] transition-colors duration-200">
          <svg className="w-4 h-4 text-[#8888aa] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Ketik judul, genre, atau nama studio..." 
            className="bg-transparent border-none outline-none text-[14px] text-[#e8e8f0] w-full placeholder:text-[#8888aa]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Area Hasil Pencarian */}
      <div className="mt-8">
        {isSearching && query.trim() !== "" ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#8888aa]">
            <div className="w-8 h-8 border-[3px] border-[#7c6af7]/20 border-t-[#7c6af7] rounded-full animate-spin"></div>
            <p className="text-sm">Mencari...</p>
          </div>
        ) : debouncedQuery.trim() === "" ? (
          <div className="text-center py-16 px-8 text-[#8888aa]">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-[#e8e8f0] mb-2">Mulai Pencarian</h3>
            <p className="text-sm">Ketik kata kunci di atas untuk mulai mencari.</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[18px]">
            {searchResults.map((movie, idx) => (
              <MovieCard 
                key={`search-res-${idx}`} 
                movie={movie} 
                onClick={() => handleOpenDetail(movie.nama)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-8 text-[#8888aa]">
            <div className="text-5xl mb-4">❌</div>
            <h3 className="text-lg font-bold text-[#e8e8f0] mb-2">Film tidak ditemukan</h3>
            <p className="text-sm">Coba gunakan kata kunci lain.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;