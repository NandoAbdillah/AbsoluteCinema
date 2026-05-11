import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isBridgeReady, setIsBridgeReady] = useState(false);
  const [allMovies, setAllMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Menunggu koneksi Ultralight...");
  
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("info");

  const [isAdmin, setIsAdmin] = useState(false);

  // === STATE BARU UNTUK TAHAP 8 (MODAL ADMIN LOGIN) ===
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // === STATE UNTUK TAHAP 7 (MODAL DETAIL) ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieName, setSelectedMovieName] = useState(null);

  const triggerToast = useCallback((msg, type = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }, []);

  // Fungsi Global untuk Modal Detail
  const openModal = useCallback((movieName) => {
    setSelectedMovieName(movieName);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMovieName(null), 300);
  }, []);

  // Fungsi Global untuk Admin Login
  const openAdminLogin = useCallback(() => setIsAdminLoginOpen(true), []);
  const closeAdminLogin = useCallback(() => setIsAdminLoginOpen(false), []);

  const fetchMoviesFromCPP = useCallback(() => {
    try {
      setLoadingText("Memuat data film dari C++...");
      if (typeof window.getAllMovies === 'function') {
        const raw = window.getAllMovies();
        const parsedData = JSON.parse(raw);
        setAllMovies(parsedData);
        setIsLoading(false);
      } else {
        throw new Error("Fungsi getAllMovies belum di-inject.");
      }
    } catch (e) {
      console.error("[React Bridge] Error fetching movies:", e);
      setLoadingText(`Gagal memuat data: ${e.message}`);
      setAllMovies([]);
    }
  }, []);

  useEffect(() => {
    window.onBridgeReady = () => {
      setIsBridgeReady(true);
      fetchMoviesFromCPP();
    };

    if (typeof window.getAllMovies === 'function' && !isBridgeReady) {
       setIsBridgeReady(true);
       fetchMoviesFromCPP();
    }
    
    return () => {
      delete window.onBridgeReady;
    };
  }, [fetchMoviesFromCPP, isBridgeReady]);

  const contextValue = {
    isBridgeReady,
    allMovies,
    setAllMovies,
    isLoading,
    loadingText,
    toastMessage,
    showToast,
    toastType,
    triggerToast,
    fetchMoviesFromCPP,
    
    // Export Admin
    isAdmin,
    setIsAdmin,
    isAdminLoginOpen,
    openAdminLogin,
    closeAdminLogin,

    // Export Modal Detail
    isModalOpen,
    selectedMovieName,
    openModal,
    closeModal
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};