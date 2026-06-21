// client/src/pages/MovieList.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeftCircle, ArrowRightCircle, ArrowLeft, Film } from "react-bootstrap-icons";
import { fetchPopularMovies, discoverMovies } from "../api/movieService";
import MovieCard from "../component/grid/MovieCard";
import '../styles/movieList.css';

export default function MovieList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // Ambil parameter dari URL
    const page = parseInt(searchParams.get("page")) || 1;
    const genre = searchParams.get("genre");
    const year = searchParams.get("year");
    const isAdult = searchParams.get("isAdult");

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                let data;
                
                // Jika ada filter genre atau tahun, gunakan discover
                if (genre || year) {
                    const params = { 
                        page,
                        isAdult // Masukkan ke params discover
                    };
                    if (genre) params.genre = genre;
                    if (year) params.year = year;
                    
                    data = await discoverMovies(params);
                } else {
                    // Jika Popular, kirim juga isAdult
                    data = await fetchPopularMovies(page, isAdult);
                }
                
                setMovies(data.results || []);
                setTotalPages(Math.min(data.total_pages || 1, 500)); 
            } catch (error) {
                console.error("Gagal ambil data film:", error);
                setMovies([]);
            } finally {
                setLoading(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        };

        fetchMovies();
    }, [page, genre, year, isAdult]);

    const handlePageChange = (newPage) => {
        const params = { page: newPage.toString() };
        if (genre) params.genre = genre;
        if (year) params.year = year;
        if (isAdult) params.isAdult = isAdult;
        setSearchParams(params);
    };

    // Determine title based on filters
    const getPageTitle = () => {
        if (genre && year) return `Film Genre & Tahun ${year}`;
        if (genre) return `Film Berdasarkan Genre`;
        if (year) return `Film Tahun ${year}`;
        return "Film Populer";
    };

    if (loading) {
        return (
            <div className="list-loading-container">
                <div className="list-loading-content">
                    <Spinner animation="border" variant="warning" className="list-spinner" />
                    <p className="list-loading-text">Memuat daftar film...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="movie-list-page">
            {/* Decorative Background Pattern */}
            <div className="list-pattern"></div>
            
            {/* Decorative Elements */}
            <div className="list-decoration">
                <div className="list-deco-circle list-deco-1"></div>
                <div className="list-deco-circle list-deco-2"></div>
                <div className="list-deco-circle list-deco-3"></div>
            </div>

            <Container className="list-container">
                {/* Header Section */}
                <div className="list-header">
                    <button 
                        className="list-back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                        <span>Kembali</span>
                    </button>
                    
                    <div className="list-title-wrapper">
                        <div className="list-icon-wrapper">
                            <Film size={32} />
                        </div>
                        <div className="list-title-content">
                            <h1 className="list-title">{getPageTitle()}</h1>
                            <p className="list-subtitle">
                                {movies.length > 0 && `${movies.length} film tersedia`}
                            </p>
                        </div>
                    </div>

                    {movies.length > 0 && (
                        <div className="list-info-badge">
                            <span className="list-page-info">
                                Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                {movies.length === 0 ? (
                    <div className="list-empty-state">
                        <div className="list-empty-icon">🎬</div>
                        <h3 className="list-empty-title">Tidak Ada Film</h3>
                        <p className="list-empty-text">
                            Tidak ada film ditemukan dengan filter yang dipilih
                        </p>
                        <button 
                            className="list-empty-btn"
                            onClick={() => navigate('/')}
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="list-results-grid">
                            <Row>
                                {movies.map((movie) => (
                                    <Col key={movie.id} xs={12} sm={6} md={4} lg={3} xl={2.4} className="mb-4">
                                        <MovieCard movie={movie} />
                                    </Col>
                                ))}
                            </Row>
                        </div>

                        {/* Pagination Navigation */}
                        <div className="list-pagination">
                            <Button
                                className="list-nav-btn list-nav-prev"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                            >
                                <ArrowLeftCircle size={28} />
                            </Button>

                            <div className="list-page-indicator">
                                <span className="list-page-current">{page}</span>
                                <span className="list-page-divider">/</span>
                                <span className="list-page-total">{totalPages}</span>
                            </div>

                            <Button
                                className="list-nav-btn list-nav-next"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                            >
                                <ArrowRightCircle size={28} />
                            </Button>
                        </div>
                    </>
                )}
            </Container>
        </div>
    );
}