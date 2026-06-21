import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { createContext, useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { setWatchlist, clearUser } from './redux/userSlice';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/style.css';
import './styles/movieGrid.css';
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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setUser(res.data);

      const watchlistRes = await api.get('/users/watchlist/me');
      dispatch(setWatchlist(watchlistRes.data || []));

    } catch (error) {
      setUser(null);
      dispatch(setWatchlist([]));
    } finally {
      setIsLoading(false);
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

  const value = { user, setUser,login, logout, isLoading };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      <Toaster position="top-center" />
      {!hideLayoutRoutes.includes(location.pathname) && <Header />}
      <main className={hideLayoutRoutes.includes(location.pathname) ? '' : 'main-content'}>
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