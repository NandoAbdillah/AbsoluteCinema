import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

// =========================================================================
// KOMPONEN CUSTOM ANTI-CRASH (Berdasarkan ide cemerlang Mas Nando!)
// Menggantikan <input> dan <textarea> bawaan yang rawan bikin Ultralight crash
// =========================================================================
const SafeInput = ({ value, onChange, placeholder, isTextArea = false, onEnter }) => {
  const divRef = useRef(null);

  // Mencegah kursor loncat saat React nge-render ulang state
  useEffect(() => {
    if (divRef.current && divRef.current.textContent !== value) {
      divRef.current.textContent = value;
    }
  }, [value]);

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={(e) => onChange(e.currentTarget.textContent || "")}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !isTextArea) {
          e.preventDefault();
          if (onEnter) onEnter();
        }
      }}
      className={`w-full bg-[#1e1e2e] border border-white/10 rounded-[10px] px-[14px] py-[12px] text-[#e8e8f0] text-[14px] outline-none focus:border-[#7c6af7] transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-[#8888aa] ${isTextArea ? 'min-h-[100px]' : 'min-h-[48px]'}`}
    />
  );
};

const AdminPanel = () => {
  const { isAdmin, triggerToast, fetchMoviesFromCPP } = useContext(AppContext);
  const navigate = useNavigate();

  // State untuk TMDB Search
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbType, setTmdbType] = useState("false"); // false = Film, true = Series
  const [isSearchingTMDB, setIsSearchingTMDB] = useState(false);
  const [tmdbResult, setTmdbResult] = useState(null);

  // State untuk form tambah data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    overview: "",
    genreStr: "",
    rating: "",
    poster: "",
    backdrop: "",
    year: "",
    isFilm: "true",
    episode: "0",
    season: "0",
    relatedStr: "",
    studio: ""
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#8888aa]">
        <div className="text-[64px] mb-4">🔐</div>
        <h2 className="text-xl font-bold text-[#e8e8f0] mb-2">Akses Ditolak</h2>
        <p className="mb-6">Anda harus login sebagai admin untuk mengakses halaman ini.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-[#1e1e2e] hover:bg-[#252535] text-white rounded-lg transition-colors border border-white/10 cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const updateForm = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleTMDBAuth = () => {
    if (!tmdbQuery.trim()) return;
    setIsSearchingTMDB(true);
    triggerToast("Mencari di TMDB...", "info");

    // Pakai setTimeout tipis biar UI loading muter dulu
    setTimeout(() => {
      try {
        if (typeof window.searchTMDB === 'function') {
          const isSeries = tmdbType === "true";
          const raw = window.searchTMDB(tmdbQuery, isSeries);
          if (raw !== "null" && raw !== false && raw !== "false") {
            const m = JSON.parse(raw);
            setTmdbResult(m);
            
            // Auto-fill form
            setFormData(prev => ({
              ...prev,
              nama: m.nama || "",
              overview: m.overview || "",
              poster: m.poster || "",
              backdrop: m.backdrop || "",
              year: m.year?.toString() || "",
              studio: m.studio || "",
              episode: m.episode?.toString() || "0",
              season: m.season?.toString() || "0",
              isFilm: isSeries ? "false" : "true"
            }));
            triggerToast(`✅ Data "${m.nama}" berhasil ditemukan!`, "success");
          } else {
            triggerToast("Film tidak ditemukan di TMDB.", "error");
          }
        } else {
          triggerToast("Fungsi C++ searchTMDB belum tersedia.", "error");
        }
      } catch (e) {
        console.error(e);
        triggerToast("Gagal mencari data di TMDB.", "error");
      } finally {
        setIsSearchingTMDB(false);
      }
    }, 50);
  };

  const handleSubmitData = () => {
    if (!formData.nama.trim()) return triggerToast("Nama film wajib diisi.", "error");
    if (!formData.genreStr.trim()) return triggerToast("Genre wajib diisi.", "error");

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const payload = {
          ...formData,
          posterUrl: formData.poster,
          rating: parseFloat(formData.rating) || 0.0,
          episode: parseInt(formData.episode) || 0,
          season: parseInt(formData.season) || 0,
          isFilm: formData.isFilm === "true"
        };

        if (typeof window.addMovie === 'function') {
          const jsonStr = JSON.stringify(payload);
          const raw = window.addMovie(jsonStr);
          const result = JSON.parse(raw);

          if (result.success) {
            triggerToast("✅ " + (result.message || "Film berhasil ditambahkan!"), "success");
            fetchMoviesFromCPP(); // Refresh global list

            // Reset Form
            setFormData({
              nama: "", overview: "", genreStr: "", rating: "", poster: "", backdrop: "", 
              year: "", isFilm: "true", episode: "0", season: "0", relatedStr: "", studio: ""
            });
            setTmdbQuery("");
            setTmdbResult(null);
          } else {
            triggerToast("❌ " + (result.message || "Gagal menambahkan film."), "error");
          }
        } else {
          triggerToast("Fungsi C++ addMovie belum siap.", "error");
        }
      } catch (e) {
        console.error(e);
        triggerToast("Terjadi kesalahan sistem saat menyimpan.", "error");
      } finally {
        setIsSubmitting(false);
      }
    }, 50);
  };

  return (
    <div className="pb-8 flex justify-center">
      <div className="bg-[#16161f] border border-[#7c6af733] rounded-[20px] p-8 w-full max-w-[620px]">
        <h2 className="text-[22px] font-extrabold mb-2 text-[#e8e8f0]">➕ Tambah Film / Series</h2>
        <p className="text-[13px] text-[#8888aa] mb-7">Gunakan pencarian TMDB atau isi manual secara lengkap.</p>

        {/* Section: TMDB Search */}
        <div className="mb-6 bg-[#1a1a24] p-5 rounded-[14px] border border-white/5">
          <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Cari di TMDB (Opsional)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              {/* Pakai SafeInput Anti-Crash */}
              <SafeInput 
                value={tmdbQuery} 
                onChange={setTmdbQuery} 
                placeholder="Ketik judul..." 
                onEnter={handleTMDBAuth}
              />
            </div>
            
            {/* Mengganti <select> bawaan menjadi Toggle Button agar tidak crash */}
            <div className="flex bg-[#1e1e2e] p-1 rounded-[10px] border border-white/10 h-[48px]">
              <button 
                onClick={() => setTmdbType("false")} 
                className={`px-4 text-[13px] font-bold rounded-lg transition-colors cursor-pointer border-none ${tmdbType === "false" ? 'bg-[#7c6af7] text-white' : 'bg-transparent text-[#8888aa] hover:text-white'}`}
              >
                Film
              </button>
              <button 
                onClick={() => setTmdbType("true")} 
                className={`px-4 text-[13px] font-bold rounded-lg transition-colors cursor-pointer border-none ${tmdbType === "true" ? 'bg-[#7c6af7] text-white' : 'bg-transparent text-[#8888aa] hover:text-white'}`}
              >
                Series
              </button>
            </div>

            <button
              onClick={handleTMDBAuth}
              disabled={isSearchingTMDB || !tmdbQuery.trim()}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-[10px] px-5 font-semibold transition-colors disabled:opacity-50 h-[48px] cursor-pointer"
            >
              {isSearchingTMDB ? "..." : "Cari"}
            </button>
          </div>

          {tmdbResult && (
            <div className="mt-4 flex gap-4 bg-[#16161f] border border-white/5 rounded-xl p-4 animate-in fade-in duration-300">
              <img 
                src={tmdbResult.poster || ""} 
                alt="poster" 
                className="w-[60px] h-[90px] rounded-lg object-cover flex-shrink-0 bg-[#252535]"
                onError={(e) => e.target.style.display = 'none'}
              />
              <div>
                <h4 className="text-[15px] font-bold mb-1 text-[#e8e8f0]">{tmdbResult.nama}</h4>
                <p className="text-[12px] text-[#8888aa] line-clamp-3">{tmdbResult.overview}</p>
              </div>
            </div>
          )}
        </div>

        <hr className="border-white/5 mb-6" />

        {/* Section: Manual Data Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="md:col-span-2">
            <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Nama Film / Series *</label>
            <SafeInput value={formData.nama} onChange={(val) => updateForm('nama', val)} placeholder="Contoh: Andor" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Genre *</label>
            <SafeInput value={formData.genreStr} onChange={(val) => updateForm('genreStr', val)} placeholder="Action, Drama, History" />
            <div className="text-[11px] text-[#8888aa] mt-[5px]">Genre valid: Action, Animated, Documentary, Drama, History, Horror, Musical, Mystery, War</div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Overview / Sinopsis</label>
            <SafeInput value={formData.overview} onChange={(val) => updateForm('overview', val)} placeholder="Deskripsi singkat film..." isTextArea={true} />
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Tipe</label>
             {/* Mengganti <select> dengan UI Toggle aman */}
            <div className="flex w-full bg-[#1e1e2e] p-1 rounded-[10px] border border-white/10 h-[48px]">
              <button onClick={() => updateForm('isFilm', "true")} className={`flex-1 text-[13px] font-bold rounded-lg transition-colors cursor-pointer border-none ${formData.isFilm === "true" ? 'bg-[#2dd4bf] text-[#0f0f17]' : 'bg-transparent text-[#8888aa]'}`}>Film</button>
              <button onClick={() => updateForm('isFilm', "false")} className={`flex-1 text-[13px] font-bold rounded-lg transition-colors cursor-pointer border-none ${formData.isFilm === "false" ? 'bg-[#7c6af7] text-white' : 'bg-transparent text-[#8888aa]'}`}>Series</button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Tahun Rilis</label>
            <SafeInput value={formData.year} onChange={(val) => updateForm('year', val)} placeholder="2023" />
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Jumlah Season</label>
            <div className={formData.isFilm === "true" ? "opacity-50 pointer-events-none" : ""}>
              <SafeInput value={formData.season} onChange={(val) => updateForm('season', val)} placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Jumlah Episode</label>
            <div className={formData.isFilm === "true" ? "opacity-50 pointer-events-none" : ""}>
              <SafeInput value={formData.episode} onChange={(val) => updateForm('episode', val)} placeholder="0" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Film Terkait (Pisahkan Koma)</label>
            <SafeInput value={formData.relatedStr} onChange={(val) => updateForm('relatedStr', val)} placeholder="Avengers, Iron Man, Thor" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#8888aa] mb-[7px]">Studio / Production</label>
            <SafeInput value={formData.studio} onChange={(val) => updateForm('studio', val)} placeholder="Marvel Studios" />
          </div>
        </div>

        <button
          onClick={handleSubmitData}
          disabled={isSubmitting}
          className="w-full bg-[#7c6af7] hover:bg-[#a78bfa] text-white border-none rounded-[10px] py-[14px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Menyimpan...</>
          ) : "Simpan ke Database"}
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;