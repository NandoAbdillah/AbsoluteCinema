import { useLocation, useNavigate } from 'react-router-dom';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Logika dinamis buat ganti judul halaman berdasarkan route saat ini
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Beranda';
      case '/genre': return 'Genre';
      case '/search': return 'Cari Film';
      case '/films': return 'Semua Film';
      case '/series': return 'Semua Series';
      case '/admin': return 'Tambah Film / Series';
      default: return 'Wordboxd';
    }
  };

  // Fungsi quick search mirip yang di index.html
  const handleSearch = (e) => {
    const val = e.target.value;
    if (val.trim().length > 0 && location.pathname !== '/search') {
      navigate('/search');
    }
    // Nanti di Tahap 5 fungsi doSearch(val) akan diimplementasi di halaman Search
    console.log("Mencari:", val); 
  };

  return (
    <div className="flex items-center gap-4 px-7 py-5 bg-[#16161f] border-b border-white/5">
      <div className="text-lg font-bold flex-1">
        {getPageTitle()}
      </div>
      
      <div className="flex items-center gap-[10px] bg-[#1e1e2e] border border-white/10 rounded-[10px] px-[14px] py-[9px] w-[280px] focus-within:border-[#7c6af7] transition-colors duration-200">
        <svg className="w-4 h-4 text-[#8888aa] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          type="text" 
          placeholder="Cari film, series..." 
          className="bg-transparent border-none outline-none text-[14px] text-[#e8e8f0] w-full placeholder:text-[#8888aa]"
          onChange={handleSearch}
        />
      </div>
    </div>
  );
};

export default Topbar;