import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const GENRES = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    53: 'Thriller', 10752: 'War', 37: 'Western'
};

const GenreMovieCard = ({ movie, onClick }) => {
    const [rating, setRating] = useState({ avg: 0 });
    useEffect(() => {
        if (!movie?.id) return;
        api.get(`/reviews/stats/${movie.id}`).then(res => setRating(res.data || {})).catch(() => {});
    }, [movie.id]);

    return (
        <div onClick={() => onClick(movie.id)} className="bg-surface-card border border-outline-variant/60 rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:border-primary/30 transition-all">
            <div className="relative aspect-[2/3] overflow-hidden">
                <img
                    src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/300x450/1D232C/A7AFBA?text=No+Image'}
                    alt={movie.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-background/85 backdrop-blur-sm px-2 py-0.5 rounded text-primary text-xs font-bold flex items-center gap-1 border border-primary/30">
                    <span className="material-symbols-outlined text-[12px] fill-icon text-primary">star</span>
                    {rating.avg ? rating.avg.toFixed(1) : '0.0'}
                </div>
            </div>
            <div className="p-3">
                <h6 className="text-sm font-heading font-semibold text-text-primary truncate group-hover:text-primary transition-colors">{movie.title}</h6>
                <p className="text-xs text-text-muted mt-1">{movie.release_date?.slice(0, 4) || 'N/A'}</p>
            </div>
        </div>
    );
};

export default function GenrePage() {
    const { genreId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isAdult = searchParams.get('isAdult');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const genreName = GENRES[genreId] || 'Unknown';

    useEffect(() => { fetchMoviesByGenre(); }, [genreId, page, isAdult]);

    const fetchMoviesByGenre = async () => {
        setLoading(true);
        try {
            const res = await api.get('/movies/discover', { params: { genre: genreId, page, isAdult } });
            setMovies(res.data.results);
            setTotalPages(res.data.total_pages > 500 ? 500 : res.data.total_pages);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    if (loading && page === 1) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                <p className="mt-4 text-text-secondary">Loading {genreName} films...</p>
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
                        <h1 className="text-3xl font-heading font-bold text-text-primary">{genreName}</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            <span className="text-primary font-bold">{movies.length}</span> films found
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {movies.map((movie) => (
                        <GenreMovieCard key={movie.id} movie={movie} onClick={(id) => navigate(`/movie/${id}`)} />
                    ))}
                </div>

                {page < totalPages && (
                    <div className="text-center mt-12">
                        <button onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={loading}
                            className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider disabled:opacity-50">
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
