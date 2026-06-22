import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

/* ── Rating Badge ── */
const PosterRating = ({ movieId }) => {
    const [r, setR] = useState({ avg: 0 });
    useEffect(() => {
        api.get(`/reviews/stats/${movieId}`).then(res => setR(res.data || {})).catch(() => {});
    }, [movieId]);
    return (
        <div className="absolute top-3 right-3 bg-background/85 backdrop-blur-sm px-2 py-0.5 rounded text-primary text-xs font-bold flex items-center gap-1 border border-primary/30 z-10">
            <span className="material-symbols-outlined text-[12px] fill-icon text-primary">star</span>
            {r.avg ? r.avg.toFixed(1) : "0.0"}
        </div>
    );
};

export default function MovieList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const page = parseInt(searchParams.get("page")) || 1;
    const genre = searchParams.get("genre");
    const year = searchParams.get("year");
    const sort = searchParams.get("sort");
    const isAdult = searchParams.get("isAdult");

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                let data;
                if (genre || year) {
                    const params = { page, isAdult };
                    if (genre) params.genre = genre;
                    if (year) params.year = year;
                    data = await api.get('/movies/discover', { params }).then(r => r.data);
                } else if (sort === 'rating') {
                    data = await api.get('/movies/top-rated', { params: { page, isAdult } }).then(r => r.data);
                } else {
                    data = await api.get('/movies/now-playing', { params: { page, isAdult } }).then(r => r.data).catch(() =>
                        api.get('/movies/popular', { params: { page, isAdult } }).then(r => r.data)
                    );
                }
                setMovies(data.results || []);
                setTotalPages(Math.min(data.total_pages || 1, 500));
            } catch (error) {
                console.error("Error fetching movies:", error);
                setMovies([]);
            } finally {
                setLoading(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        };
        fetchMovies();
    }, [page, genre, year, sort, isAdult]);

    const handlePageChange = (newPage) => {
        const params = {};
        if (newPage > 1) params.page = newPage.toString();
        if (genre) params.genre = genre;
        if (year) params.year = year;
        if (sort) params.sort = sort;
        if (isAdult) params.isAdult = isAdult;
        setSearchParams(params);
    };

    const getPageTitle = () => {
        if (genre && year) return `Movies — Genre & Year ${year}`;
        if (genre) return "Browse by Genre";
        if (year) return `Movies from ${year}`;
        if (sort === 'rating') return "Top Rated Movies";
        return "Latest Releases";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                <p className="mt-4 text-text-secondary">Loading films...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="max-w-[1280px] mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-semibold">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back
                        </button>
                        <div className="w-1 h-10 bg-primary rounded-full hidden sm:block" />
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-text-primary">{getPageTitle()}</h1>
                            <p className="text-text-secondary text-sm">
                                {movies.length} films available &bull; Page <strong className="text-primary">{page}</strong> of <strong className="text-primary">{totalPages}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {movies.length === 0 ? (
                    <div className="bg-surface-card border border-outline-variant/60 rounded-2xl p-16 text-center">
                        <span className="material-symbols-outlined text-[64px] text-text-muted mb-4">movie</span>
                        <h3 className="text-xl font-heading font-bold text-text-primary mb-3">No Films Found</h3>
                        <p className="text-text-secondary mb-6">Try adjusting your filters</p>
                        <button onClick={() => navigate('/')} className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider">
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {movies.map((movie) => (
                                <div key={movie.id} className="group cursor-pointer" onClick={() => navigate(isAdult ? `/movie/${movie.id}?isAdult=true` : `/movie/${movie.id}`)}>
                                    <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border border-outline-variant/60 bg-surface-card shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/50">
                                        <img
                                            src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : `https://via.placeholder.com/300x450/1D232C/A7AFBA?text=No+Image`}
                                            alt={movie.title}
                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        <PosterRating movieId={movie.id} />
                                    </div>
                                    <div className="mt-3 px-1">
                                        <h3 className="text-sm font-heading font-semibold text-text-primary truncate group-hover:text-primary transition-colors">{movie.title}</h3>
                                        <p className="text-xs text-text-muted mt-0.5">{movie.release_date?.split('-')[0] || 'N/A'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-6 mt-16">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="w-12 h-12 rounded-full border border-outline-variant/60 flex items-center justify-center text-text-primary hover:text-primary hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                            </button>
                            <div className="flex items-center gap-2 text-lg font-heading">
                                <span className="text-primary font-bold text-2xl">{page}</span>
                                <span className="text-text-muted">/</span>
                                <span className="text-text-secondary">{totalPages}</span>
                            </div>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="w-12 h-12 rounded-full border border-outline-variant/60 flex items-center justify-center text-text-primary hover:text-primary hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
