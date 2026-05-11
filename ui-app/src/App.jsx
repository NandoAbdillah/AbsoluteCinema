import { useContext } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import Toast from './components/Toast';

// Import Pages
import Home from './pages/Home';
import Genre from './pages/Genre';
import Search from './pages/Search';
import AllFilms from './pages/AllFilms';
import AllSeries from './pages/AllSeries';
import AdminPanel from './pages/AdminPanel'; // <-- Ini penting buat Tahap 8

// Import Modals
import MovieDetailModal from './components/MovieDetailModal';
import AdminLoginModal from './components/AdminLoginModal'; // <-- Ini biar modal loginnya muncul

const AppContent = () => {
  const { isLoading, loadingText, toastMessage, showToast, toastType } = useContext(AppContext);

  if (isLoading) {
    return <LoadingScreen text={loadingText} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/genre" element={<Genre />} />
          <Route path="/search" element={<Search />} />
          <Route path="/films" element={<AllFilms />} />
          <Route path="/series" element={<AllSeries />} />
          <Route path="/admin" element={<AdminPanel />} /> {/* <-- Rute admin udah bener */}
        </Routes>
        
        {/* Render Modal secara global */}
        <MovieDetailModal />
        <AdminLoginModal /> {/* <-- Modal login admin ditaruh sini */}

        {/* Toast Notification */}
        <Toast 
          message={toastMessage} 
          isVisible={showToast} 
          onClose={() => {}} 
          type={toastType} 
        />
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;