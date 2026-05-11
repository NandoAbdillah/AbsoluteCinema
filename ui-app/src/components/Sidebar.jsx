import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

// Komponen helper biar kode rapi, otomatis ngurus styling kalau menu lagi aktif
const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 px-[14px] py-[11px] rounded-[10px] text-sm transition-all duration-200 select-none cursor-pointer
      ${isActive 
        ? 'bg-[#7c6af72e] text-[#a78bfa]' 
        : 'text-[#8888aa] hover:bg-[#1e1e2e] hover:text-[#e8e8f0]'
      }
    `}
  >
    {icon}
    {label}
  </NavLink>
);

const Sidebar = () => {
  // Tambahan openAdminLogin di sini mas!
  const { isAdmin, openAdminLogin } = useContext(AppContext);

  return (
    <nav className="w-[240px] h-screen bg-[#16161f] flex flex-col py-7 border-r border-white/5 flex-shrink-0">
      {/* Logo Area */}
      <div className="px-6 pb-8 text-[22px] font-extrabold tracking-tight bg-gradient-to-br from-[#a78bfa] to-[#2dd4bf] bg-clip-text text-transparent">
        Word<span className="font-light">boxd</span>
      </div>

      {/* Main Navigation */}
      <div className="px-3 mb-2 flex flex-col gap-1">
        <div className="text-[10px] uppercase tracking-[1.5px] text-[#8888aa] px-3 mb-[6px]">Menu</div>
        
        <NavItem 
          to="/" 
          label="Beranda" 
          icon={<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>} 
        />
        <NavItem 
          to="/genre" 
          label="Genre" 
          icon={<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>} 
        />
        <NavItem 
          to="/search" 
          label="Cari Film" 
          icon={<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>} 
        />
        <NavItem 
          to="/films" 
          label="Semua Film" 
          icon={<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>} 
        />
        <NavItem 
          to="/series" 
          label="Semua Series" 
          icon={<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" /><polyline points="17 2 12 7 7 2" /></svg>} 
        />
      </div>

      {/* Footer / Admin Navigation */}
      <div className="mt-auto px-3">
        {isAdmin && (
          <div className="flex items-center gap-2 px-[14px] py-[10px] bg-[#7c6af726] border border-[#7c6af74d] rounded-[10px] text-[13px] text-[#a78bfa] mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Mode Admin
          </div>
        )}
        
        {isAdmin ? (
          <NavItem 
            to="/admin" 
            label="Panel Admin" 
            icon={<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>} 
          />
        ) : (
          <button 
            // Nah ini yang tadinya console.log sekarang manggil fungsi aslinya
            onClick={openAdminLogin} 
            className="w-full flex items-center gap-3 px-[14px] py-[11px] rounded-[10px] text-[14px] text-[#8888aa] hover:bg-[#1e1e2e] hover:text-[#e8e8f0] transition-all cursor-pointer border-none bg-transparent"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Admin Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;