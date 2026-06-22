import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import api from "../api/api";
import toast from 'react-hot-toast';

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const WatchlistCard = ({ movie, onClick, onRemove }) => {
    const [rating, setRating] = useState({ avg: 0 });
    useEffect(() => {
        if (!movie?.id) return;
        api.get(`/reviews/stats/${movie.id}`).then(res => setRating(res.data || {})).catch(() => {});
    }, [movie.id]);

    return (
        <div
            className="bg-surface-card border border-outline-variant/60 rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:border-primary/30 transition-all"
            onClick={() => onClick(movie.id)}
        >
            <div className="relative">
                <div className="aspect-[2/3] overflow-hidden">
                    <img
                        src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "https://via.placeholder.com/500x750/1D232C/A7AFBA?text=No+Image"}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                        loading="lazy"
                    />
                </div>
                <div className="absolute top-3 right-3 bg-background/85 backdrop-blur-sm px-2 py-0.5 rounded text-primary text-xs font-bold flex items-center gap-1 border border-primary/30">
                    <span className="material-symbols-outlined text-[12px] fill-icon text-primary">star</span>
                    {rating.avg ? rating.avg.toFixed(1) : "0.0"}
                </div>
                <button
                    onClick={(e) => onRemove(movie.id, e)}
                    className="absolute top-3 left-3 bg-red-600/90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
            </div>
            <div className="p-4">
                <h3 className="text-sm font-heading font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                    {movie.title}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
            </div>
        </div>
    );
};

export default function Watchlist() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [watchlistMovies, setWatchlistMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [movieToDelete, setMovieToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!user) { toast.error("Silakan login terlebih dahulu"); navigate("/signin"); return; }
        fetchWatchlist();
    }, [user, navigate]);

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/watchlist/me');
            const movieIds = res.data;
            if (movieIds.length === 0) { setWatchlistMovies([]); setLoading(false); return; }

            const moviesWithDetails = await Promise.all(
                movieIds.map(async (movieId) => {
                    try { return (await api.get(`/movies/${movieId}`)).data; }
                    catch (error) { return null; }
                })
            );
            setWatchlistMovies(moviesWithDetails.filter(Boolean));
        } catch (error) {
            toast.error("Gagal memuat watchlist");
        } finally {
            setLoading(false);
        }
    };

    const initiateDelete = (movieId, e) => {
        e.stopPropagation();
        setMovieToDelete(movieId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!movieToDelete) return;
        setIsDeleting(true);
        try {
            await api.post('/users/watchlist/toggle', { tmdbMovieId: movieToDelete });
            setWatchlistMovies(prev => prev.filter(m => m.id !== movieToDelete));
            toast.success("Film dihapus dari watchlist");
            setShowDeleteModal(false);
        } catch (error) {
            toast.error("Gagal menghapus dari watchlist");
        } finally {
            setIsDeleting(false);
            setMovieToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-primary/20"></div>
                <p className="mt-4 text-text-secondary">Loading watchlist...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="max-w-[1280px] mx-auto px-6 py-12">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 text-sm font-semibold">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back
                </button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1 h-10 bg-primary rounded-full" />
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-text-primary">My Watchlist</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            <span className="text-primary font-bold">{watchlistMovies.length}</span> films saved to watch later
                        </p>
                    </div>
                </div>

                {watchlistMovies.length === 0 ? (
                    <div className="bg-surface-card border border-outline-variant/60 rounded-2xl p-16 text-center">
                        <span className="material-symbols-outlined text-[64px] text-text-muted mb-4">bookmark</span>
                        <h3 className="text-xl font-heading font-bold text-text-primary mb-3">Watchlist is Empty</h3>
                        <p className="text-text-secondary mb-6">Start adding films you want to watch!</p>
                        <button onClick={() => navigate("/")} className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider">
                            Explore Films
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {watchlistMovies.map((movie) => (
                            <WatchlistCard key={movie.id} movie={movie} onClick={(id) => navigate(`/movie/${id}`)} onRemove={initiateDelete} />
                        ))}
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)} />
                    <div className="relative bg-surface-card border border-outline-variant/60 rounded-2xl w-full max-w-sm p-8 shadow-2xl z-10 text-center">
                        <span className="material-symbols-outlined text-[48px] text-primary mb-4">warning</span>
                        <h3 className="text-xl font-heading font-bold text-text-primary mb-2">Remove from Watchlist?</h3>
                        <p className="text-text-secondary text-sm mb-6">Are you sure you want to remove this film?</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="w-full py-2.5 border border-outline-variant/60 rounded-lg text-text-secondary font-semibold text-sm hover:text-text-primary transition-colors">Cancel</button>
                            <button onClick={confirmDelete} disabled={isDeleting} className="w-full py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors">{isDeleting ? "Removing..." : "Yes, Remove"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
