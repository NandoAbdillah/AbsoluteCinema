import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#0f0f17] text-[#e8e8f0] overflow-hidden font-sans">
      {/* Kolom Kiri: Sidebar statis */}
      <Sidebar />
      
      {/* Kolom Kanan: Topbar + Area Konten dinamis */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar />
        
        {/* Area Konten Utama */}
        {/* scroll-smooth dan styling scrollbar bawaan Tailwind */}
        <main className="flex-1 overflow-y-auto p-7 scroll-smooth 
          [&::-webkit-scrollbar]:w-[6px] 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-[#252535] 
          [&::-webkit-scrollbar-thumb]:rounded-[3px]"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;