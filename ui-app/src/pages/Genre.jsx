import  { useState, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import MovieCard from "../components/MovieCard";

const GENRE_ICONS = {
  Action: "⚔️",
  Animated: "🎨",
  Documentary: "📹",
  Drama: "🎭",
  History: "🏛️",
  Horror: "👻",
  Musical: "🎵",
  Mystery: "🔍",
  War: "🪖",
};

const Genre = () => {
  const { allMovies, openModal } = useContext(AppContext);
  const [activeGenre, setActiveGenre] = useState(null);

  // Logika mendapatkan data Genre (Prioritas dari C++, Fallback ngitung manual)
  const genres = useMemo(() => {
    try {
      // Coba ambil dari bridge C++ dulu
      if (typeof window.getGenres === "function") {
        const raw = window.getGenres();
        return JSON.parse(raw);
      } else {
        throw new Error("getGenres belum siap atau tidak tersedia.");
      }
    } catch (e) {
      console.warn(
        "[React Bridge] Menggunakan fallback kalkulasi Genre lokal karena:",
        e.message,
      );
      // Fallback: Hitung genre manual dari data allMovies yang sudah ada
      const genreSet = {};
      allMovies.forEach((m) => {
        m.genre?.forEach((g) => {
          genreSet[g] = (genreSet[g] || 0) + 1;
        });
      });

      const generatedGenres = Object.keys(genreSet)
        .sort()
        .map((k) => ({ nama: k, count: genreSet[k] }));

      return generatedGenres;
    }
  }, [allMovies]);

  // Filter film berdasarkan genre yang aktif, lalu di-sort rating tertinggi
  const filteredMovies = useMemo(() => {
    if (!activeGenre) return [];
    return allMovies
      .filter((m) => m.genre?.includes(activeGenre))
      .sort((a, b) => b.rating - a.rating);
  }, [activeGenre, allMovies]);

  // Fungsi sementara buat testing klik detail, nanti disambung ke Modal di Tahap 7
  const handleOpenDetail = (movieName) => {
    console.log("Buka detail untuk:", movieName);
    openModal(movieName);
  };

  return (
    <div className="pb-8">
      {/* Tampilan Grid Genre Utama */}
      {!activeGenre ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-8">
          {genres.map((g, idx) => (
            <div
              key={idx}
              onClick={() => setActiveGenre(g.nama)}
              className="bg-[#16161f] border border-white/5 rounded-[14px] px-5 py-6 cursor-pointer transition-all duration-200 relative overflow-hidden group hover:border-[#7c6af7] hover:bg-[#1e1e2e] hover:-translate-y-[2px]"
            >
              {/* Garis aksen atas saat hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c6af7] to-[#2dd4bf] opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>

              <div className="text-[32px] mb-2.5">
                {GENRE_ICONS[g.nama] || "🎬"}
              </div>
              <div className="text-base font-bold mb-1">{g.nama}</div>
              <div className="text-[12px] text-[#8888aa]">{g.count} judul</div>
            </div>
          ))}
        </div>
      ) : (
        /* Tampilan Daftar Film Berdasarkan Genre Aktif */
        <div>
          <div className="flex items-center justify-between mb-[18px]">
            <div className="text-[18px] font-bold flex items-center gap-2">
              <span>{GENRE_ICONS[activeGenre] || "🎬"}</span>
              Genre: {activeGenre}
            </div>
            <button
              onClick={() => setActiveGenre(null)}
              className="text-[13px] text-[#a78bfa] cursor-pointer opacity-80 hover:opacity-100 transition-opacity bg-transparent border-none"
            >
              ← Kembali
            </button>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[18px]">
              {filteredMovies.map((movie, idx) => (
                <MovieCard
                  key={idx}
                  movie={movie}
                  onClick={() => handleOpenDetail(movie.nama)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#8888aa]">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-lg font-bold text-[#e8e8f0] mb-2">
                Belum ada film
              </h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Genre;
