import { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import StarPicker from "./StarPicker";
import MovieCard from "./MovieCard";

const MovieDetailModal = () => {
  const {
    isModalOpen,
    selectedMovieName,
    closeModal,
    triggerToast,
    allMovies,
    setAllMovies,
    openModal,
  } = useContext(AppContext);

  const [movie, setMovie] = useState(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  // STATE BARU: Buat nyimpen angka bintang yang dipilih user
  const [userRating, setUserRating] = useState(0); 

  useEffect(() => {
    let isMounted = true;

    const fetchMovie = async () => {
      try {
        if (typeof window.searchMovie === "function") {
          const raw = window.searchMovie(selectedMovieName);
          if (raw !== "null") {
            if (isMounted) setMovie(JSON.parse(raw));
          } else {
            triggerToast("Film tidak ditemukan di database.", "error");
            closeModal();
          }
        } else {
          const found = allMovies.find((m) => m.nama === selectedMovieName);
          if (found && isMounted) setMovie(found);
          else closeModal();
        }
      } catch (e) {
        console.error("Error parsing detail:", e);
        triggerToast("Gagal mengambil detail film.", "error");
      }
    };

    if (isModalOpen && selectedMovieName) {
      fetchMovie();
      setUserRating(0); // Reset bintang jadi 0 tiap kali buka film baru
    } else {
      const timeoutId = setTimeout(() => {
        if (isMounted) {
            setMovie(null);
            setUserRating(0); // Bersihkan pilihan bintang pas modal ditutup
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }

    return () => {
      isMounted = false;
    };
  }, [isModalOpen, selectedMovieName, allMovies, closeModal, triggerToast]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeModal]);

  const handleRate = (rating) => {
    if (!movie || isSubmittingRating) return;

    setUserRating(rating); // Update UI bintang supaya angkanya muncul
    setIsSubmittingRating(true);
    
    try {
      if (typeof window.rateMovie === "function") {
        const raw = window.rateMovie(movie.nama, rating);
        if (raw === false || raw === "false") {
          triggerToast("Gagal memberi rating.", "error");
          setUserRating(0); // Kalau gagal, kembalikan bintang ke 0
        } else {
          const updatedMovie = JSON.parse(raw);
          setMovie(updatedMovie); 
          setAllMovies((prev) =>
            prev.map((m) => (m.nama === updatedMovie.nama ? updatedMovie : m)),
          );
          triggerToast(
            `✅ Rating berhasil disimpan! Rata-rata sekarang: ${updatedMovie.rating.toFixed(1)}`,
            "success",
          );
        }
      } else {
        triggerToast("Fungsi rateMovie C++ belum siap.", "error");
        setUserRating(0);
      }
    } catch (e) {
      console.error(e);
      triggerToast("Terjadi kesalahan sistem.", "error");
      setUserRating(0);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const relatedMovies = useMemo(() => {
    if (!movie || !movie.related || movie.related.length === 0) return [];
    return allMovies.filter((m) => movie.related.includes(m.nama));
  }, [movie, allMovies]);

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isModalOpen && !movie) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center transition-all duration-300 p-6 ${isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      onClick={closeModal}
    >
      <div
        className={`bg-[#16161f] border border-white/10 rounded-[20px] w-full max-w-[820px] max-h-[90vh] overflow-y-auto flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 ${isModalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        onClick={handleModalClick}
      >
        {!movie ? (
          <div className="flex flex-col items-center justify-center p-20 text-[#8888aa] h-[400px]">
            <div className="w-10 h-10 border-[3px] border-[#7c6af7]/20 border-t-[#7c6af7] rounded-full animate-spin mb-4"></div>
            <p>Memuat detail...</p>
          </div>
        ) : (
          <>
            <div className="relative h-[260px] flex-shrink-0 bg-[#1e1e2e] rounded-t-[20px] overflow-hidden">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.nama}
                  className="w-full h-full object-cover block"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a0533] to-[#0d1a4a] flex items-center justify-center text-[64px]">
                  🎬
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#16161f] via-[#16161f]/60 to-transparent"></div>

              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center border-none cursor-pointer hover:bg-red-500/80 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-8 pb-8 pt-2">
              <h1 className="text-[28px] font-black leading-tight mb-2 text-[#e8e8f0]">
                {movie.nama}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#8888aa] mb-5">
                <span className="font-bold text-[#fbbf24] flex items-center gap-1">
                  ⭐ {movie.rating?.toFixed(1)}
                </span>
                <span>({movie.totalRating} rating)</span>
                {movie.year && <span>• {movie.year}</span>}
                <span
                  className={`px-2 py-[2px] rounded uppercase font-bold text-[10px] ${movie.isFilm ? "bg-[#2dd4bf26] text-[#2dd4bf]" : "bg-[#7c6af726] text-[#a78bfa]"}`}
                >
                  {movie.isFilm ? "Film" : "Series"}
                </span>
                {movie.genre?.map((g, i) => (
                  <span
                    key={i}
                    className="bg-white/10 px-2 py-[2px] rounded text-[11px] text-[#e8e8f0]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-[14px] leading-[1.7] text-[#b0b0c8] mb-6">
                {movie.overview || "Tidak ada deskripsi tersedia."}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-7 bg-[#1e1e2e]/50 p-4 rounded-[14px] border border-white/5">
                <div>
                  <div className="text-[11px] uppercase tracking-[1px] text-[#8888aa] mb-1">
                    Studio
                  </div>
                  <div className="text-[14px] font-semibold text-[#e8e8f0]">
                    {movie.studio || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[1px] text-[#8888aa] mb-1">
                    Tahun Rilis
                  </div>
                  <div className="text-[14px] font-semibold text-[#e8e8f0]">
                    {movie.year || "-"}
                  </div>
                </div>
                {!movie.isFilm && (
                  <>
                    <div>
                      <div className="text-[11px] uppercase tracking-[1px] text-[#8888aa] mb-1">
                        Total Season
                      </div>
                      <div className="text-[14px] font-semibold text-[#e8e8f0]">
                        {movie.jumlahSeason || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[1px] text-[#8888aa] mb-1">
                        Total Episode
                      </div>
                      <div className="text-[14px] font-semibold text-[#e8e8f0]">
                        {movie.jumlahEpisode || 0}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {relatedMovies.length > 0 && (
                <div className="mb-8">
                  <div className="text-[14px] font-bold text-[#8888aa] uppercase tracking-[1px] mb-3">
                    🌐 Dalam Cinematic Universe yang Sama
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#252535]">
                    {relatedMovies.map((relMovie, idx) => (
                      <div key={idx} className="w-[140px] flex-shrink-0">
                        <MovieCard
                          movie={relMovie}
                          onClick={() => openModal(relMovie.nama)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#1e1e2e] rounded-[14px] p-5 flex flex-wrap items-center gap-5 border border-white/5">
                <div className="text-[14px] font-semibold flex-shrink-0">
                  ⭐ Beri Rating
                </div>
                <div className="flex-1 flex justify-center sm:justify-start">
                  <StarPicker
                    currentRating={userRating} // UBAH: Ambil dari state userRating
                    onRate={handleRate}
                    isSubmitting={isSubmittingRating}
                  />
                </div>
                <div className="text-[24px] font-black text-[#fbbf24] min-w-[40px] text-center">
                  {isSubmittingRating ? (
                    <span className="text-sm animate-pulse">...</span>
                  ) : (
                    userRating > 0 ? userRating : "-" // UBAH: Tampilkan angka yang dipilih
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieDetailModal;