import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleWatchlistState } from "../redux/userSlice";
import api from "../api/api";
import toast from "react-hot-toast";
import { useAuth } from "../App.jsx";
import "../styles/MovieDetail.css";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const isAscii = (str = "") => /^[ -~\s'".,:;-]+$/.test(str);
const getMovieTitle = (movie) => {
    if (!movie) return "";
    const title = movie.title || "";
    const original = movie.original_title || "";
    if (isAscii(title) && title.trim() !== "") return title;
    if (isAscii(original) && original.trim() !== "") return original;
    return title;
};

const formatRuntime = (minutes) => {
    if (!minutes) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
        return `${h}h ${m}m`;
    }
    return `${m}m`;
};

const formatRevenue = (revenue) => {
    if (!revenue) return "";
    if (revenue >= 1.0e9) return `$${(revenue / 1.0e9).toFixed(1)}B`;
    if (revenue >= 1.0e6) return `$${(revenue / 1.0e6).toFixed(1)}M`;
    return `$${revenue.toLocaleString()}`;
};

/* ── Star Rating Component ── */
const StarRating = ({ rating, setRating, hover, setHover, disabled }) => (
    <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((value) => (
            <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setRating(value)}
                onMouseEnter={() => !disabled && setHover(value)}
                onMouseLeave={() => !disabled && setHover(0)}
                className="text-3xl transition-colors cursor-pointer bg-transparent border-none p-0"
                style={{ color: value <= (hover || rating) ? "#D4A017" : "#4b5563" }}
            >
                ★
            </button>
        ))}
    </div>
);

export default function MovieDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { watchlist } = useSelector((state) => state.user);

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watchlistLoading, setWatchlistLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);

    // Review modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const numericMovieId = Number(id);
    const isMovieInWatchlist = watchlist.includes(numericMovieId);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchMovieData();
    }, [id]);

    const fetchMovieData = async () => {
        if (!movie) setLoading(true);
        try {
            const [movieRes, reviewsRes, similarRes] = await Promise.all([
                api.get(`/movies/${id}`),
                api.get(`/reviews/movie/${id}`),
                api.get(`/movies/${id}/similar`),
            ]);
            setMovie(movieRes.data);
            setReviews(reviewsRes.data);
            setSimilarMovies(similarRes.data || []);
        } catch (error) {
            console.error("Gagal ambil data film:", error);
            if (!movie) toast.error("Gagal memuat data film");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleWatchlist = async () => {
        if (!user) {
            toast.error("Anda harus login untuk menambah watchlist");
            setTimeout(() => navigate("/signin", { state: { from: location } }), 1300);
            return;
        }
        setWatchlistLoading(true);
        try {
            await api.post("/users/watchlist/toggle", { tmdbMovieId: numericMovieId });
            dispatch(toggleWatchlistState(numericMovieId));
            setMovie((prev) => {
                const currentCount = prev.watchlistCount || 0;
                const newCount = isMovieInWatchlist ? Math.max(0, currentCount - 1) : currentCount + 1;
                return { ...prev, watchlistCount: newCount };
            });
            toast.success(isMovieInWatchlist ? "Dihapus dari Watchlist" : "Ditambahkan ke Watchlist");
        } catch (error) {
            toast.error("Gagal memperbarui watchlist");
        } finally {
            setWatchlistLoading(false);
        }
    };

    const handleShowAddModal = () => {
        if (!user) {
            toast.error("Silakan login terlebih dahulu");
            setTimeout(() => navigate("/signin", { state: { from: location } }), 1300);
            return;
        }
        setEditingReviewId(null);
        setUserRating(0);
        setUserReview("");
        setShowReviewModal(true);
    };

    const handleShowEditModal = (review) => {
        setEditingReviewId(review._id);
        setUserRating(review.rating);
        setUserReview(review.comment);
        setShowReviewModal(true);
    };

    const handleCloseReviewModal = () => {
        if (!isSaving) {
            setShowReviewModal(false);
            setUserRating(0);
            setUserReview("");
            setHoverRating(0);
            setEditingReviewId(null);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (userRating === 0) { toast.error("Harap isi rating!"); return; }
        if (!userReview.trim()) { toast.error("Harap isi ulasan Anda!"); return; }
        setIsSaving(true);
        try {
            if (editingReviewId) {
                await api.put(`/reviews/${editingReviewId}`, { rating: userRating, comment: userReview });
                setReviews((prev) => prev.map((r) => r._id === editingReviewId ? { ...r, rating: userRating, comment: userReview } : r));
                fetchMovieData();
                toast.success("Review berhasil diperbarui 🎉");
            } else {
                const res = await api.post("/reviews", { tmdbMovieId: id, rating: userRating, comment: userReview });
                setReviews([res.data, ...reviews]);
                setMovie((prev) => {
                    const oldCount = prev.vote_count || 0;
                    const oldAvg = prev.vote_average || 0;
                    return { ...prev, vote_count: oldCount + 1, vote_average: ((oldAvg * oldCount) + userRating) / (oldCount + 1) };
                });
                toast.success("Review berhasil dikirim 🎉");
            }
            handleCloseReviewModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal menyimpan review");
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/reviews/${reviewToDelete}`);
            setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete));
            setMovie((prev) => ({ ...prev, vote_count: Math.max(0, (prev.vote_count || 0) - 1) }));
            fetchMovieData();
            toast.success("Review berhasil dihapus");
            setShowDeleteModal(false);
        } catch (error) {
            toast.error("Gagal menghapus review");
        } finally {
            setIsDeleting(false);
            setReviewToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-primary/20"></div>
                <p className="mt-4 text-text-secondary font-medium">Loading film details...</p>
            </div>
        );
    }
    if (!movie) return null;

    const director = movie?.credits?.crew?.find((p) => p.job === "Director")?.name || "N/A";
    const writers = movie?.credits?.crew
        ? movie.credits.crew
            .filter((p) => p.department === "Writing" || p.job === "Writer" || p.job === "Screenplay" || p.job === "Story")
            .slice(0, 2)
            .map((p) => p.name)
            .join(", ")
        : "";
    const mainCast = movie?.credits?.cast ? movie.credits.cast.slice(0, 6) : [];
    const backdropUrl = movie.backdrop_path
        ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}`
        : movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null;

    return (
        <div className="min-h-screen bg-background text-text-primary pt-20 relative">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-24 left-6 md:left-margin-page z-20 flex items-center gap-2 text-text-secondary hover:text-primary transition-all text-sm font-semibold bg-background/70 backdrop-blur-md px-4 py-2.5 rounded-full border border-outline-variant/50 shadow-lg shadow-black/20 cursor-pointer hover:border-primary/50"
            >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back
            </button>

            {/* ── Hero / Backdrop Section ── */}
            <section className="relative w-full min-h-[480px] md:min-h-[560px] flex items-end pt-28 md:pt-32">
                {/* Full-width backdrop image with dramatic shadow gradients */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {backdropUrl ? (
                        <img
                            src={backdropUrl}
                            alt=""
                            className="w-full h-full object-cover object-center"
                            style={{ filter: "brightness(0.35)" }}
                        />
                    ) : (
                        <div className="w-full h-full bg-surface-container-lowest" />
                    )}
                    {/* Deep shadow gradients — "neon shadows" cinematic look */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
                </div>

                {/* Content — poster prominently featured over the backdrop */}
                <div className="max-w-container mx-auto px-margin-page w-full z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 lg:gap-14 pb-6 md:pb-10">
                    {/* Poster Card — large, always visible, with dramatic shadow */}
                    <div className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px] shrink-0">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden border-2 border-outline-variant/60 shadow-[0_20px_60px_rgba(0,0,0,0.7)] shadow-black/50 relative group">
                            <img
                                className="w-full h-full object-cover"
                                src={movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : "https://via.placeholder.com/300x450/1D232C/A7AFBA?text=No+Image"}
                                alt={movie.title}
                            />
                            {/* Subtle gold border shimmer on hover */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-xl transition-colors duration-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Movie Info — aligned beside the poster */}
                    <div className="flex flex-col gap-stack-md md:gap-stack-lg flex-1 pb-2 text-center md:text-left">
                        <div className="flex flex-col gap-stack-sm">
                            {/* Mobile: smaller headline */}
                            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg lg:text-headline-xl text-text-primary leading-tight tracking-tight">
                                {getMovieTitle(movie)}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-text-secondary font-body-md">
                                <span className="font-medium text-text-primary/80">{movie.release_date?.slice(0, 4)}</span>
                                {movie.runtime && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-text-muted" />
                                        <span className="text-text-secondary">{formatRuntime(movie.runtime)}</span>
                                    </>
                                )}
                                {movie.genres?.length > 0 && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-text-muted" />
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            {movie.genres.map((g) => (
                                                <span
                                                    key={g.id}
                                                    className="bg-surface-card/80 backdrop-blur-sm px-3 py-1 rounded-full text-text-secondary font-label-md text-label-md border border-outline-variant/60"
                                                >
                                                    {g.name}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Rating + Actions Row */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 md:gap-6">
                            <div className="flex flex-col items-center md:items-start">
                                <span className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-primary font-bold leading-none">
                                    {movie.vote_average?.toFixed(1) || "0.0"}
                                    <span className="font-body-md text-body-md text-text-secondary font-normal ml-1">/10</span>
                                </span>
                                <span className="font-label-md text-label-md text-text-muted mt-0.5">RAUL Rating</span>
                            </div>
                            <div className="h-10 w-px bg-outline-variant/50 hidden sm:block" />
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
                                <button
                                    onClick={handleToggleWatchlist}
                                    disabled={watchlistLoading}
                                    className="bg-primary-container text-on-primary-container font-label-lg text-label-lg px-6 md:px-8 py-3 rounded-lg hover:bg-gold-hover transition-all duration-200 font-semibold flex items-center gap-2 cursor-pointer border-none shadow-lg shadow-primary-container/20 hover:shadow-gold-hover/30"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {isMovieInWatchlist ? "check" : "add"}
                                    </span>
                                    {watchlistLoading ? "Saving..." : isMovieInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                                </button>
                                <button
                                    onClick={handleShowAddModal}
                                    className="bg-transparent border border-outline-variant text-text-primary font-label-lg text-label-lg px-6 md:px-8 py-3 rounded-lg hover:bg-surface-card hover:border-primary/40 transition-all duration-200 font-semibold flex items-center gap-2 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[20px]">star</span>
                                    Rate
                                </button>
                            </div>
                        </div>

                        {/* Director / Writers / Box Office */}
                        <div className="flex flex-wrap gap-x-6 md:gap-x-8 gap-y-2 mt-2 md:mt-3 pt-4 border-t border-outline-variant/30 justify-center md:justify-start">
                            <div className="flex items-center gap-2">
                                <span className="font-label-md text-label-md text-primary uppercase tracking-wider">Director</span>
                                <span className="font-body-md text-body-md text-text-secondary">{director}</span>
                            </div>
                            {writers && (
                                <div className="flex items-center gap-2">
                                    <span className="font-label-md text-label-md text-primary uppercase tracking-wider">Writers</span>
                                    <span className="font-body-md text-body-md text-text-secondary">{writers}</span>
                                </div>
                            )}
                            {movie.revenue > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="font-label-md text-label-md text-primary uppercase tracking-wider">Box Office</span>
                                    <span className="font-body-md text-body-md text-text-secondary">{formatRevenue(movie.revenue)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Main Details Grid ── */}
            <div className="max-w-container mx-auto px-margin-page grid grid-cols-1 gap-grid-gutter pb-section-gap pt-10 md:pt-16">
                <div className="flex flex-col gap-section-gap mx-auto max-w-[900px] w-full">
                    {/* Synopsis */}
                    <section className="flex flex-col gap-stack-md">
                        <div className="flex items-center gap-3 border-b border-outline-variant pb-3">
                            <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                            <h2 className="font-headline-sm text-headline-sm text-text-primary">Synopsis</h2>
                        </div>
                        <p className="font-body-lg text-body-lg text-text-secondary leading-relaxed">
                            {movie.overview || "No description available."}
                        </p>
                    </section>

                    {/* Cast & Crew */}
                    {mainCast.length > 0 && (
                        <section className="flex flex-col gap-stack-md">
                            <div className="flex items-center gap-3 border-b border-outline-variant pb-3">
                                <span className="material-symbols-outlined text-primary text-[24px]">groups</span>
                                <h2 className="font-headline-sm text-headline-sm text-text-primary">Cast &amp; Crew</h2>
                            </div>
                            <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar snap-x justify-start md:justify-center">
                                {mainCast.map((actor) => (
                                    <div
                                        key={actor.id}
                                        onClick={() => navigate(`/search?query=${encodeURIComponent(actor.name)}`)}
                                        className="flex flex-col items-center gap-3 min-w-[120px] snap-start group cursor-pointer"
                                    >
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-outline-variant shadow-lg shadow-black/30">
                                            <img
                                                className="w-full h-full object-cover"
                                                src={actor.profile_path ? `${TMDB_IMAGE_BASE}/w185${actor.profile_path}` : "https://via.placeholder.com/150/1D232C/A7AFBA?text=Actor"}
                                                alt={actor.name}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-label-lg text-label-lg text-text-primary truncate max-w-[140px] group-hover:text-primary transition-colors">{actor.name}</p>
                                            <p className="font-body-sm text-body-sm text-text-muted truncate max-w-[140px]">{actor.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* User Reviews */}
                    <section className="flex flex-col gap-stack-md">
                        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[24px]">reviews</span>
                                <h2 className="font-headline-sm text-headline-sm text-text-primary">Top Reviews</h2>
                            </div>
                            <button
                                onClick={handleShowAddModal}
                                className="font-label-lg text-label-lg text-primary hover:text-gold-hover transition-colors bg-transparent border-none cursor-pointer font-semibold"
                            >
                                Write a Review
                            </button>
                        </div>
                        {reviews.length === 0 ? (
                            <div className="bg-surface-card border border-outline-variant rounded-xl p-12 text-center flex flex-col items-center">
                                <span className="material-symbols-outlined text-[48px] text-text-muted mb-4">rate_review</span>
                                <h3 className="text-lg font-bold text-text-primary mb-2">No Reviews Yet</h3>
                                <p className="text-text-secondary mb-4 max-w-sm">Be the first to share your thoughts on this film.</p>
                                <button
                                    onClick={handleShowAddModal}
                                    className="bg-primary-container text-on-primary-container font-label-lg text-label-lg px-6 py-2.5 rounded-lg hover:bg-gold-hover transition-all duration-200 font-semibold uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-primary-container/20"
                                >
                                    Write a Review
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.map((rev) => (
                                    <div
                                        key={rev._id}
                                        className="bg-surface-card p-6 rounded-xl border border-outline-variant flex flex-col gap-4 relative group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-black/20"
                                    >
                                        {user && (user._id === rev.user?._id || user.role === "admin") && (
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button
                                                    onClick={() => handleShowEditModal(rev)}
                                                    className="text-text-muted hover:text-primary transition-colors p-1.5 bg-surface-container rounded-full cursor-pointer border border-outline-variant/50"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => { setReviewToDelete(rev._id); setShowDeleteModal(true); }}
                                                    className="text-text-muted hover:text-red-400 transition-colors p-1.5 bg-surface-container rounded-full cursor-pointer border border-outline-variant/50"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant/50 flex items-center justify-center font-label-lg text-label-lg text-text-primary shadow-inner">
                                                    {(rev.user?.displayName || rev.user?.username || "Anonymous").charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-label-lg text-label-lg text-text-primary">
                                                    {rev.user?.displayName || rev.user?.username || "Anonymous"}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-primary gap-0.5">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <span
                                                        key={i}
                                                        className="material-symbols-outlined text-[16px]"
                                                        style={{ color: i <= rev.rating ? "#D4A017" : "var(--color-outline-variant)", fontVariationSettings: "'FILL' 1" }}
                                                    >
                                                        star
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                                            {rev.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* ── Similar Movies Section ── */}
            {similarMovies.length > 0 && (
                <section className="max-w-container mx-auto px-margin-page pb-section-gap flex flex-col gap-stack-md">
                    <div className="flex items-center gap-3 border-b border-outline-variant pb-3">
                        <span className="material-symbols-outlined text-primary text-[24px]">recommend</span>
                        <h2 className="font-headline-sm text-headline-sm text-text-primary">Similar Movies</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 md:gap-6">
                        {similarMovies.slice(0, 6).map((sim) => (
                            <div
                                key={sim.id}
                                onClick={() => { navigate(`/movie/${sim.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                className="flex flex-col gap-3 cursor-pointer group"
                            >
                                <div className="aspect-[2/3] rounded-xl overflow-hidden border border-outline-variant bg-surface-card relative transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-black/40">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                        src={sim.poster_path ? `${TMDB_IMAGE_BASE}/w342${sim.poster_path}` : "https://via.placeholder.com/300x450/1D232C/A7AFBA?text=No+Image"}
                                        alt={sim.title}
                                    />
                                    {/* Hover overlay with play icon */}
                                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            play_circle
                                        </span>
                                    </div>
                                    {/* Rating badge atas kanan */}
                                    <div className="absolute top-2.5 right-2.5 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-primary text-xs font-bold flex items-center gap-1 border border-primary/30 z-10">
                                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        {sim.vote_average?.toFixed(1) || "0.0"}
                                    </div>
                                </div>
                                <div className="flex flex-col px-1">
                                    <span className="font-label-lg text-label-lg text-text-primary truncate group-hover:text-primary transition-colors">{sim.title}</span>
                                    <span className="font-label-md text-label-md text-text-muted mt-0.5">{sim.release_date?.slice(0, 4) || "—"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Review Modal ── */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseReviewModal} />
                    <div className="relative bg-surface-card border border-outline-variant rounded-2xl w-full max-w-md p-8 shadow-2xl z-10">
                        <h3 className="text-xl font-heading font-bold text-text-primary text-center mb-6">
                            {editingReviewId ? "Edit Review" : "Write a Review"}
                        </h3>
                        <form onSubmit={handleReviewSubmit} className="flex flex-col items-center">
                            <p className="text-text-secondary text-sm mb-3">Select Rating</p>
                            <StarRating rating={userRating} setRating={setUserRating} hover={hoverRating} setHover={setHoverRating} disabled={isSaving} />
                            <textarea
                                rows={4}
                                placeholder="Share your thoughts..."
                                value={userReview}
                                onChange={(e) => setUserReview(e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none text-sm mt-3"
                                disabled={isSaving}
                            />
                            <div className="flex gap-3 w-full mt-6">
                                <button 
                                    type="button" 
                                    onClick={handleCloseReviewModal} 
                                    disabled={isSaving} 
                                    className="flex-1 py-2.5 border border-outline-variant rounded-lg text-text-secondary hover:text-text-primary text-sm font-semibold transition-colors bg-transparent cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving} 
                                    className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-gold-hover transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer border-none"
                                >
                                    {isSaving ? "Saving..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)} />
                    <div className="relative bg-surface-card border border-outline-variant rounded-2xl w-full max-w-sm p-8 shadow-2xl z-10 text-center">
                        <span className="material-symbols-outlined text-[48px] text-primary mb-4">warning</span>
                        <h3 className="text-xl font-heading font-bold text-text-primary mb-2">Delete Review?</h3>
                        <p className="text-text-secondary text-sm mb-6">This action cannot be undone.</p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="w-full py-2.5 border border-outline-variant rounded-lg text-text-secondary font-semibold text-sm hover:text-text-primary transition-colors bg-transparent cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="w-full py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors cursor-pointer border-none"
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
