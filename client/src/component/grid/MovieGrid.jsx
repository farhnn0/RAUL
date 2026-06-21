import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/movieGrid.css";

// Komponen untuk fetch rating dari backend
const MovieCardRating = ({ movieId }) => {
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/v1/reviews/stats/${movieId}`);
                const data = await res.json();
                setRating(data.average || 0);
            } catch (err) {
                console.error('Error fetching rating:', err);
                setRating(0);
            } finally {
                setLoading(false);
            }
        };
        fetchRating();
    }, [movieId]);

    return (
        <div className="movie-rating">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#ffc107">
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
            </svg>
            <span>{loading ? '...' : rating.toFixed(1)}</span>
        </div>
    );
};

export default function MovieGrid() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const posterUrl = (movie) =>
        movie && movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/300x450/D9A299/FFFFFF?text=" + encodeURIComponent(movie.title || "No Image");

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/v1/movies/popular?page=1');

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log('✅ API Response:', data);

                if (data && data.results && data.results.length > 0) {
                    setMovies(data.results);
                    console.log('✅ Movies loaded:', data.results.length, 'films');
                } else {
                    console.warn('⚠️ No movies found in response');
                    setMovies([]);
                }
            } catch (err) {
                console.error("❌ Error fetching movies:", err);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    useEffect(() => {
        if (movies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % movies.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [movies.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % movies.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length);
    };

    const scrollToMovies = () => {
        document.getElementById('popular')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleMovieClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Memuat film...</p>
            </div>
        );
    }

    return (
        <>
            <section className="hero-section">
                <div className="hero-pattern"></div>
                <div className="hero-content-wrapper">
                    <div className="hero-text">
                        <h1 className="hero-title">Temukan Film Terbaik</h1>
                        <p className="hero-subtitle">
                            Jelajahi koleksi film populer dengan rating terbaik dari seluruh dunia
                        </p>
                    </div>

                    <div className="info-cards-container">
                        <div className="info-card">
                            <div className="icon-circle">
                                <svg width="40" height="40" viewBox="0 0 16 16" fill="#ffc107">
                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                </svg>
                            </div>
                            <h4>Rating & Ulasan</h4>
                            <p>Lihat rating dari ribuan penonton dan baca ulasan mereka</p>
                        </div>

                        <div className="info-card">
                            <div className="icon-circle">
                                <svg width="40" height="40" viewBox="0 0 16 16" fill="#D9A299">
                                    <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z" />
                                </svg>
                            </div>
                            <h4>Koleksi Film</h4>
                            <p>Ribuan film dari berbagai genre dan tahun rilis</p>
                        </div>

                        <div className="info-card">
                            <div className="icon-circle">
                                <svg width="40" height="40" viewBox="0 0 16 16" fill="#82C4A6">
                                    <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                                    <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043-7.457-7.457z" />
                                </svg>
                            </div>
                            <h4>Beragam Genre</h4>
                            <p>Action, Drama, Comedy, Horror, dan masih banyak lagi</p>
                        </div>
                    </div>

                    <button className="cta-button" onClick={scrollToMovies}>
                        Jelajahi Sekarang
                    </button>

                    <div className="scroll-indicator">
                        <div className="mouse"></div>
                        <p>Scroll untuk melihat film</p>
                    </div>
                </div>
            </section>

            <section id="popular" className="movies-section">
                <div className="section-header">
                    <h2 className="section-title">🎬 Film Populer Mingguan</h2>
                    <p className="section-subtitle">Koleksi terbaru film yang sedang trending</p>
                </div>

                <div className="swiper-container">
                    {movies.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🎬</div>
                            <p className="empty-title">Tidak Ada Film</p>
                            <p className="empty-text">
                                Pastikan backend server Anda sudah berjalan di:
                            </p>
                            <code className="empty-code">
                                http://localhost:5000
                            </code>
                            <p className="empty-hint">
                                Periksa console browser (F12) untuk detail error
                            </p>
                        </div>
                    ) : (
                        <>
                            <button className="swiper-nav swiper-prev" onClick={prevSlide}>
                                ‹
                            </button>

                            <div className="swiper-wrapper">
                                <div
                                    className="swiper-track"
                                    style={{
                                        transform: `translateX(-${currentSlide * (100 / 5.5)}%)`
                                    }}
                                >
                                    {movies.map((movie) => (
                                        <div key={movie.id} className="swiper-slide">
                                            <div
                                                className="movie-card"
                                                onClick={() => handleMovieClick(movie.id)}
                                            >
                                                <div className="movie-poster-wrapper">
                                                    <img
                                                        src={posterUrl(movie)}
                                                        alt={movie.title}
                                                        className="movie-poster"
                                                    />
                                                </div>
                                                <div className="movie-info">
                                                    <h5 className="movie-title">{movie.title}</h5>
                                                    <MovieCardRating movieId={movie.id} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="swiper-nav swiper-next" onClick={nextSlide}>
                                ›
                            </button>
                        </>
                    )}
                </div>

                <div className="section-decoration">
                    <div className="deco-circle deco-1"></div>
                    <div className="deco-circle deco-2"></div>
                    <div className="deco-circle deco-3"></div>
                </div>
            </section>
        </>
    );
}