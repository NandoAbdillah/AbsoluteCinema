import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const AdminLoginModal = () => {
  const { isAdminLoginOpen, closeAdminLogin, setIsAdmin, triggerToast } = useContext(AppContext);
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = () => {
    if (isLoggingIn || !typed.trim()) return;
    setIsLoggingIn(true);

    setTimeout(() => {
      try {
        if (typeof window.loginAdmin === "function") {
          const ok = window.loginAdmin(typed);
          if (ok) {
            setIsAdmin(true);
            setTyped("");
            triggerToast("✅ Login berhasil! Selamat datang, Admin.", "success");
            setTimeout(() => {
              closeAdminLogin();
              navigate("/admin");
            }, 300);
          } else {
            triggerToast("❌ Passphrase salah.", "error");
            setTyped("");
            setIsLoggingIn(false);
          }
        } else {
          
          if (typed === "akuadmin727") {
            setIsAdmin(true);
            setTyped("");
            triggerToast("✅ Login berhasil (Mode Tes).", "success");
            setTimeout(() => {
              closeAdminLogin();
              navigate("/admin");
            }, 300);
          } else {
            triggerToast("❌ Passphrase salah.", "error");
            setTyped("");
            setIsLoggingIn(false);
          }
        }
      } catch (e) {
        triggerToast("Terjadi kesalahan sistem.", "error");
        setIsLoggingIn(false);
      }
    }, 50);
  };

  if (!isAdminLoginOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center"
      onClick={closeAdminLogin}
    >
      <div
        className="bg-[#16161f] border border-[#7c6af74d] rounded-[20px] p-10 w-[400px] text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[22px] font-bold mb-2 text-[#e8e8f0]">🔐 Admin Login</h2>
        <p className="text-[13px] text-[#8888aa] mb-7">
          Masukkan passphrase untuk masuk ke mode admin.
        </p>

        {/* contentEditable sebagai pengganti input - tidak crash di Ultralight */}
        <div className="mb-5 text-left">
          <div
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Ketik passphrase di sini..."
            onInput={(e) => setTyped(e.currentTarget.textContent || "")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full bg-[#1e1e2e] border border-white/10 rounded-[10px] px-[14px] py-[12px] text-[#e8e8f0] text-[14px] outline-none focus:border-[#7c6af7] transition-colors min-h-[48px] empty:before:content-[attr(data-placeholder)] empty:before:text-[#8888aa]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoggingIn || !typed.trim()}
          className="w-full flex items-center justify-center bg-[#7c6af7] hover:bg-[#a78bfa] text-white border-none rounded-[10px] py-[12px] text-[14px] font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? "Memverifikasi..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default AdminLoginModal;