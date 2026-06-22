import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { createContext, useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { setWatchlist, clearUser } from './redux/userSlice';
import { Toaster } from 'react-hot-toast';
import api from './api/api';

import Home from './pages/Home';
import SignIn from './pages/Signin';
import SignUp from './pages/Signup';
import ForgetPassword from './pages/ForgetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminDashboard from './pages/AdminDashboard';
import Header from './component/layout/Navbar';
import Footer from './component/layout/Footer';
import MovieDetail from './pages/MovieDetail';
import MovieList from './pages/MovieList';
import SearchResult from './pages/SearchResult';
import MyReviews from './pages/MyReviews';
import Watchlist from './pages/Watchlist';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import GenrePage from './pages/GenrePage';
import YearPage from './pages/YearPage';
import ProfilePage from './pages/ProfilePage';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();
  const hideLayoutRoutes = ['/signin', '/signup', '/forget-password', '/privacy-policy', '/verify-email', '/reset-password'];

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProfile(cancelled);
    return () => { cancelled = true; };
  }, []);

  const fetchProfile = async (cancelled = false) => {
    try {
      const res = await api.get('/users/profile');
      if (cancelled) return;
      setUser(res.data);
      const watchlistRes = await api.get('/users/watchlist/me');
      if (cancelled) return;
      dispatch(setWatchlist(watchlistRes.data || []));
    } catch (error) {
      if (cancelled) return;
      setUser(null);
      dispatch(setWatchlist([]));
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.status === 200) {
      setUser(res.data);
      const watchlistRes = await api.get('/users/watchlist/me');
      dispatch(setWatchlist(watchlistRes.data || []));
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      dispatch(clearUser());
    }
  };

  const value = { user, setUser, login, logout, isLoading };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-primary/20"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1D232C',
            color: '#FFFFFF',
            border: '1px solid #2A303A',
          },
        }}
      />
      {!hideLayoutRoutes.includes(location.pathname) && <Header />}
      <main className={hideLayoutRoutes.includes(location.pathname) ? '' : 'min-h-screen'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/movie" element={<MovieList />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/my-reviews" element={<MyReviews />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/genre/:genreId" element={<GenrePage />} />
          <Route path="/year/:year" element={<YearPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      {!hideLayoutRoutes.includes(location.pathname) && <Footer />}
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
