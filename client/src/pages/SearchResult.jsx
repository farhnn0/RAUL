import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const MovieCardWithRating = ({ movie, onClick }) => {
    const [rating, setRating] = useState({ avg: 0, count: 0 });
    useEffect(() => {
        if (!movie?.id) return;
        api.get(`/reviews/stats/${movie.id}`).then(res => setRating(res.data || {})).catch(() => {});
    }, [movie.id]);

    return (
        <div onClick={() => onClick(movie.id)} className="bg-surface-card border border-outline-variant/60 rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:border-primary/30 transition-all">
            <div className="relative aspect-[2/3] overflow-hidden">
                <img
                    src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/300x450/1D232C/A7AFBA?text=No+Image'}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    loading="lazy"
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

const SearchResult = () => {
    const [searchData, setSearchData] = useState({ resultsByTitle: [], resultsByActor: [], actorName: null });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('query');
    const isAdult = searchParams.get('isAdult');

    useEffect(() => {
        if (!query) return;
        const fetchSearchResults = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await api.get('/movies/search', { params: { query, isAdult } });
                const data = res.data;
                setSearchData({
                    resultsByTitle: data.resultsByTitle || [],
                    resultsByActor: data.resultsByActor || [],
                    actorName: data.actorName
                });
                if ((!data.resultsByTitle || data.resultsByTitle.length === 0) && (!data.resultsByActor || data.resultsByActor.length === 0)) {
                    setError(`No results found for "${query}"`);
                }
            } catch (error) {
                setError("An error occurred while searching");
                setSearchData({ resultsByTitle: [], resultsByActor: [], actorName: null });
            } finally { setIsLoading(false); }
        };
        fetchSearchResults();
    }, [query, isAdult]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                <p className="mt-4 text-text-secondary">Searching for "{query}"...</p>
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
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[24px]">search</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-text-primary">Search Results</h1>
                        <p className="text-text-secondary text-sm">
                            "{query}" {isAdult === 'true' && <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-xs ml-2 font-bold">18+</span>}
                        </p>
                    </div>
                </div>

                {error ? (
                    <div className="bg-surface-card border border-outline-variant/60 rounded-2xl p-16 text-center">
                        <span className="material-symbols-outlined text-[64px] text-text-muted mb-4">movie</span>
                        <h3 className="text-xl font-heading font-bold text-text-primary mb-3">No Results</h3>
                        <p className="text-text-secondary mb-6">{error}</p>
                        <button onClick={() => navigate('/')} className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider">
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <div>
                        {searchData.resultsByTitle.length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-xl font-heading font-semibold text-primary mb-5 border-b border-outline-variant/30 pb-3">
                                    By Movie Title
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                    {searchData.resultsByTitle.map((movie) => (
                                        <MovieCardWithRating key={movie.id} movie={movie} onClick={(id) => navigate(`/movie/${id}`)} />
                                    ))}
                                </div>
                            </section>
                        )}
                        {searchData.resultsByActor.length > 0 && (
                            <section>
                                <h2 className="text-xl font-heading font-semibold text-primary mb-5 border-b border-outline-variant/30 pb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                    Films starring: {searchData.actorName}
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                    {searchData.resultsByActor.map((movie) => (
                                        <MovieCardWithRating key={movie.id} movie={movie} onClick={(id) => navigate(`/movie/${id}`)} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResult;
