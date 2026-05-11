import { useEffect } from 'react';

// Props yang diterima:
// - message: Teks pesan notifikasi
// - isVisible: Boolean untuk menampilkan/menyembunyikan Toast
// - onClose: Fungsi callback yang dipanggil saat waktu Toast habis (untuk mengubah isVisible dari komponen induk)
// - type: Tipe notifikasi ('info', 'success', 'error') untuk mengubah warna
const Toast = ({ message, isVisible, onClose, type = 'info' }) => {

  // Efek untuk mengatur timer auto-hide
  useEffect(() => {
    let timer;
    if (isVisible) {
      // Jika Toast muncul, set timer 3 detik untuk memanggil onClose
      timer = setTimeout(() => {
        onClose();
      }, 3000);
    }
    
    // CLEANUP FUNCTION: Sangat penting!
    // Ini memastikan timer dibatalkan jika komponen di-unmount atau isVisible berubah
    // sebelum 3 detik selesai. Mencegah error "Can't perform a React state update on an unmounted component"
    // dan memory leak yang sering terjadi di Ultralight environment.
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, onClose]); // Dependensi: efek berjalan ulang jika isVisible atau onClose berubah

  // Tentukan warna border/icon berdasarkan tipe
  let borderColor = 'border-l-[#7c6af7]'; // Default info (Ungu)
  if (type === 'success') borderColor = 'border-l-[#2dd4bf]'; // Teal
  if (type === 'error') borderColor = 'border-l-[#f87171]';   // Merah

  return (
    // Gunakan class bawaan Tailwind untuk transisi: opacity dan transform translateY
    <div 
      className={`
        fixed bottom-8 right-8 bg-[#252535] rounded-xl px-5 py-[14px] text-sm text-[#e8e8f0] 
        shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-[320px] border-l-4 ${borderColor} z-[999]
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      {message}
    </div>
  );
};

export default Toast;