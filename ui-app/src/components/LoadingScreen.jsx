
// Props yang diterima:
// - text: Teks pesan loading yang ditampilkan di bawah spinner
const LoadingScreen = ({ text = "Memuat data..." }) => {
  return (
    // Overlay Fullscreen: z-index tinggi (500) menutupi seluruh UI, bg menyesuaikan tema Wordboxd
    <div className="fixed inset-0 bg-[#0f0f17] z-[500] flex flex-col items-center justify-center gap-5">
      
      {/* Teks Logo Wordboxd dengan efek gradien */}
      <div className="text-[28px] font-black bg-gradient-to-br from-[#a78bfa] to-[#2dd4bf] bg-clip-text text-transparent mb-2 tracking-tight">
        Word<span className="font-light">boxd</span>
      </div>
      
      {/* Spinner Animasi Berputar */}
      <div className="w-12 h-12 border-[3px] border-[#7c6af7]/20 border-t-[#7c6af7] rounded-full animate-spin"></div>
      
      {/* Teks Status Loading */}
      <div className="text-base text-[#8888aa]">
        {text}
      </div>
    </div>
  );
};

export default LoadingScreen;