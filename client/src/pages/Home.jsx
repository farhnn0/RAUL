import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/api";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

/* ── Rating badge ── */
const PosterRating = ({ movieId }) => {
    const [r, setR] = useState({ avg: 0 });
    useEffect(() => {
        let cancelled = false;
        api.get(`/reviews/stats/${movieId}`)
            .then(res => { if (!cancelled) setR(res.data || {}); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [movieId]);
    return (
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded text-primary text-xs font-bold flex items-center gap-1 border border-primary/30 z-10">
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            {r.avg ? r.avg.toFixed(1) : "0.0"}
        </div>
    );
};

/* ── Movie Card ── */
const MovieCard = ({ movie, onClick }) => (
    <div
        className="flex-none w-[180px] md:w-[200px] snap-start group cursor-pointer"
        onClick={() => onClick(movie.id)}
    >
        <div className="w-full aspect-[2/3] rounded-xl overflow-hidden border border-border-color bg-surface-card relative transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50">
            <img
                src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : `https://via.placeholder.com/300x450/1D232C/A7AFBA?text=No+Image`}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                loading="lazy"
            />
            <PosterRating movieId={movie.id} />
        </div>
        <div className="mt-3 px-1">
            <h3 className="text-sm font-heading font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                {movie.title}
            </h3>
            <p className="text-xs text-text-muted mt-0.5 font-medium">
                {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
            </p>
        </div>
    </div>
);

/* ── Horizontal Scroll Row ── */
const MovieRow = ({ title, subtitle, movies, loading, onMovieClick }) => {
    const scrollRef = useRef(null);
    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === 'left' ? -500 : 500, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-10 md:py-14">
            <div className="flex items-end justify-between mb-6 border-b border-border-color pb-4">
                <div>
                    <h2 className="text-headline-sm md:text-headline-md text-text-primary tracking-tight font-heading font-semibold">
                        {title}
                    </h2>
                    <p className="text-body-sm text-text-secondary mt-1">{subtitle}</p>
                </div>
                {movies.length > 0 && (
                    <div className="hidden sm:flex items-center gap-2">
                        <button onClick={() => scroll('left')}
                            className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        <button onClick={() => scroll('right')}
                            className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex gap-6 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex-none w-[180px] md:w-[200px]">
                            <div className="w-full aspect-[2/3] rounded-xl bg-surface-card animate-pulse" />
                            <div className="mt-3 h-4 bg-surface-card rounded animate-pulse w-3/4" />
                            <div className="mt-2 h-3 bg-surface-card rounded animate-pulse w-1/2" />
                        </div>
                    ))}
                </div>
            ) : movies.length === 0 ? (
                <div className="bg-surface-card border border-border-color rounded-xl p-8 text-center">
                    <span className="material-symbols-outlined text-[40px] text-text-muted">movie</span>
                    <p className="text-text-secondary mt-2 text-body-sm">No movies available</p>
                </div>
            ) : (
                <div ref={scrollRef}
                    className="flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar">
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
                    ))}
                </div>
            )}
        </section>
    );
};

/* ── Genre Bento Cards ── */
const genreCards = [
    { id: 28, name: "Action", span: "sm:col-span-2 sm:row-span-2", bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfWRyH7a5ETMWpem74j2P7FE4Jxzdt5_RxC6j76qU1Dtn8gGfTzab5zBtVrV5cUfoLiWotqSd0s0ckYVc-wcO11FNfw0ycxx88la5I13dQdcMynLg8Ce9y45RaXGXPASZ_UxD58BXZORCp4hTnXBLXm9gcFy0jDSSgU6Bgq9bofV1FAqubZwcLkKxwCWhpgA8Dl6sEKegcLyoOUwsQmLR4CpjXPeMe0AVIE0wuwgi89bpZbRHRw7JNsNnWh_63XWjZdFGQ7NyYult3" },
    { id: 18, name: "Drama", span: "", bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBK7yYvfaV_rw5C14tiab9_O2uTaeTwgyjVfRTgyPFhoXnvhS65Sch28UeCmvhFJBvY0SNxEfw3HbbOBhsCr8Suj-9xW3rqkQeiL5tgQSrbJ53EKDKX6WOwuBDUQGTlKsd6PG2jm4SzMaGR0-X-729SJmsb2PVEc2KtHwHmbn392zVdjgoQ7Pcjnq4zQMj3Tmck3WlTVl6jmTPWUpUnTSXhCkCjvq1OWvcp1w1u3rl3ccQ38xAn6W9yFlHuQiBNnpOlHv_bwy4urcBG" },
    { id: 878, name: "Sci-Fi", span: "", bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd2mJz1GWiyNOzo6fB8YMDVY3DdacXWd0PCRyEXjRZ5KhMa-6Yph9l1IYaRE-spr2iym8owlXp9jOnMhbnpv_Ooqfhi8py8eT95othv1lvzivuGt9wMs13SvgumViCjrf15qjVkAU7byE2J178ju9huXySFJD7TqFEbHmZhoB7wNkXFA82OBc238NGkk-N3Sma25nxcFELOxHara_mmX0p2WICKTy5SIdacd5WZAzoKFbpzkzcW3PS4uUlJ6FoF-G_TJIi6Oncwmzz" },
    { id: 27, name: "Horror", span: "sm:col-span-2", bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdoqCmAGD_SQvASvPLhk_bxvlmp8RLbVr8ZmVDRSzcwP_eu1sUg6-oWARd5130gwhOtOX8QSccWTIIseN5_9mUBiJHlMkw9rdCVTBgvjqKtPpszQSCtxM0ZXMZmz7pOdv7zILQHUBUd4QP9vFfpHfDmhtjufpXIQu7QjnWeWGfDoz2hEBocWJ3tcVag1a2aGHHzRz5RAVfgbYPcYC1M7u9RPO5QfqwwbGIHA9GA9-8se2c9Ztkxrr9bTsNATsT2dqxlD-D8mguG2FX" },
];

/* ── Main Home ── */
export default function Home() {
    const [searchParams] = useSearchParams();
    const isAdult = searchParams.get('isAdult') === 'true';
    const navigate = useNavigate();

    const [trending, setTrending] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [actionMovies, setActionMovies] = useState([]);
    const [dramaMovies, setDramaMovies] = useState([]);
    const [horrorMovies, setHorrorMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchAll = async () => {
            setLoading(true);
            try {
                const adultParam = isAdult ? 'true' : 'false';
                const [popRes, topRes, actionRes, dramaRes, horrorRes] = await Promise.all([
                    api.get('/movies/popular', { params: { page: 1, isAdult: adultParam } }),
                    api.get('/movies/top-rated', { params: { page: 1, isAdult: adultParam } }).catch(() => ({ data: { results: [] } })),
                    api.get('/movies/discover', { params: { page: 1, genre: '28', isAdult: adultParam } }).catch(() => ({ data: { results: [] } })),
                    api.get('/movies/discover', { params: { page: 1, genre: '18', isAdult: adultParam } }).catch(() => ({ data: { results: [] } })),
                    api.get('/movies/discover', { params: { page: 1, genre: '27', isAdult: adultParam } }).catch(() => ({ data: { results: [] } })),
                ]);
                if (cancelled) return;
                setTrending(popRes.data?.results || []);
                setTopRated(topRes.data?.results || []);
                setActionMovies(actionRes.data?.results || []);
                setDramaMovies(dramaRes.data?.results || []);
                setHorrorMovies(horrorRes.data?.results || []);
            } catch (err) {
                console.error("Error fetching home data:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchAll();
        return () => { cancelled = true; };
    }, [isAdult]);

    const handleMovieClick = useCallback((movieId) => {
        navigate(isAdult ? `/movie/${movieId}?isAdult=true` : `/movie/${movieId}`);
    }, [navigate, isAdult]);

    const scrollToContent = () => {
        document.getElementById('home-content')?.scrollIntoView({ behavior: 'smooth' });
    };

    const heroMovie = trending[0];
    const heroPoster = heroMovie?.poster_path ? `${TMDB_IMAGE_BASE}${heroMovie.poster_path}` : null;
    const heroMovie2 = trending[1];
    const heroPoster2 = heroMovie2?.poster_path ? `${TMDB_IMAGE_BASE}${heroMovie2.poster_path}` : null;

    return (
        <div className="min-h-screen bg-background pt-20">
            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
                </div>
                <div className="max-w-container mx-auto px-margin-page relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12 items-center min-h-[70vh] py-16 lg:py-24">
                        <div className="lg:w-7/12 flex flex-col space-y-6 text-center lg:text-left">
                            <h1 className="text-headline-lg-mobile md:text-headline-xl text-text-primary tracking-tight font-heading font-extrabold">
                                Discover Cinema's<br />
                                <span className="text-primary">Finest Moments</span>
                            </h1>
                            <p className="text-body-lg text-text-secondary max-w-xl leading-relaxed">
                                Explore thousands of films, read community reviews, and find your next watch with our editorial curation platform.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <button onClick={scrollToContent}
                                    className="min-w-[200px] bg-primary text-on-primary font-bold px-8 py-3.5 rounded-full hover:bg-gold-hover active:scale-[0.98] transition-all text-label-lg uppercase tracking-wider">
                                    Start Exploring
                                </button>
                                <button onClick={scrollToContent}
                                    className="min-w-[200px] border border-border-color text-text-primary font-semibold px-8 py-3.5 rounded-full hover:bg-surface-card active:scale-[0.98] transition-all text-label-lg uppercase tracking-wider">
                                    Trending Films
                                </button>
                            </div>
                        </div>

                        <div className="lg:w-5/12 relative h-[400px] md:h-[480px] hidden lg:flex items-center justify-center">
                            {heroPoster && (
                                <div className="absolute w-[220px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-border-color transform -rotate-6 -translate-x-10 hover:rotate-0 hover:scale-105 hover:z-20 transition-all duration-300 z-10 cursor-pointer"
                                    onClick={() => heroMovie && handleMovieClick(heroMovie.id)}>
                                    <img src={heroPoster} alt={heroMovie?.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            {heroPoster2 && (
                                <div className="absolute w-[220px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-border-color transform rotate-6 translate-x-14 translate-y-6 opacity-70 hover:rotate-0 hover:scale-105 hover:opacity-100 transition-all duration-300 z-0 cursor-pointer"
                                    onClick={() => heroMovie2 && handleMovieClick(heroMovie2.id)}>
                                    <img src={heroPoster2} alt={heroMovie2?.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Categories ── */}
            <div id="home-content" className="max-w-container mx-auto px-margin-page">
                <MovieRow title="Trending This Week" subtitle="What everyone's watching right now"
                    movies={trending} loading={loading} onMovieClick={handleMovieClick} />

                <MovieRow title="Top Rated" subtitle="Highest rated by the community"
                    movies={topRated.length > 0 ? topRated : trending.slice().reverse()}
                    loading={loading} onMovieClick={handleMovieClick} />

                <MovieRow title="Action & Adventure" subtitle="High-octane thrills and epic quests"
                    movies={actionMovies.length > 0 ? actionMovies : trending.filter((_, i) => i % 2 === 0)}
                    loading={loading} onMovieClick={handleMovieClick} />

                <MovieRow title="Drama" subtitle="Powerful stories and unforgettable performances"
                    movies={dramaMovies.length > 0 ? dramaMovies : trending.filter((_, i) => i % 2 === 1)}
                    loading={loading} onMovieClick={handleMovieClick} />

                <MovieRow title="Horror" subtitle="Chilling tales that keep you up at night"
                    movies={horrorMovies.length > 0 ? horrorMovies : trending.filter((_, i) => i % 3 === 0)}
                    loading={loading} onMovieClick={handleMovieClick} />

                {/* ── Genre Bento ── */}
                <section className="py-10 md:py-14">
                    <div className="mb-6 border-b border-border-color pb-4">
                        <h2 className="text-headline-sm md:text-headline-md text-text-primary tracking-tight font-heading font-semibold">Explore Genres</h2>
                        <p className="text-body-sm text-text-secondary mt-1">Browse films by your favorite genre</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid-gutter auto-rows-[160px]">
                        {genreCards.map((genre) => (
                            <Link key={genre.id} to={isAdult ? `/genre/${genre.id}?isAdult=true` : `/genre/${genre.id}`}
                                className={`${genre.span} relative rounded-xl overflow-hidden group border border-border-color`}>
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url("${genre.bg}")` }} />
                                <div className="absolute inset-0 bg-background/60 group-hover:bg-background/40 transition-colors duration-300" />
                                <div className="absolute bottom-0 left-0 p-5 w-full text-left">
                                    <h3 className="text-headline-sm font-heading font-semibold text-text-primary">{genre.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
