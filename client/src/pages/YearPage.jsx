import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import { Container, Row, Col, Card, Spinner, Breadcrumb, Badge } from 'react-bootstrap';
import { StarFill, Calendar } from 'react-bootstrap-icons';
import '../styles/GenrePage.css'; // Menggunakan style yang sama dengan GenrePage

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// === [BARU] Komponen Helper untuk Rating (Tampilan Sama Persis) ===
const YearMovieCard = ({ movie, onClick }) => {
    const [rating, setRating] = useState({ avg: 0, count: 0 });

    useEffect(() => {
        if (!movie?.id) return;
        const fetchRating = async () => {
            try {
                // Ambil rating asli dari database kamu
                const res = await api.get(`/reviews/stats/${movie.id}`);
                if (res.data) {
                    setRating({ avg: res.data.average || 0, count: res.data.count || 0 });
                }
            } catch (err) { /* silent error */ }
        };
        fetchRating();
    }, [movie.id]);

    return (
        <Card
            className="movie-card"
            onClick={() => onClick(movie.id)}
        >
            <div className="poster-wrapper">
                <Card.Img
                    variant="top"
                    src={
                        movie.poster_path
                            ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
                            : 'https://via.placeholder.com/300x450?text=No+Image'
                    }
                    alt={movie.title}
                />

                {/* Rating Badge (Sekarang Dinamis dari DB) */}
                <div className="rating-overlay">
                    <StarFill size={12} className="me-1" />
                    <span>{rating.avg > 0 ? rating.avg.toFixed(1) : '0.0'}</span>
                </div>
            </div>

            <Card.Body className="p-2">
                <h6 className="movie-title text-light mb-1">
                    {movie.title}
                </h6>
                <div className="movie-year text-secondary">
                    <Calendar size={10} className="me-1" />
                    {movie.release_date?.slice(0, 4) || 'N/A'}
                </div>
            </Card.Body>
        </Card>
    );
};

export default function YearPage() {
    const { year } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isAdult = searchParams.get('isAdult');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchMoviesByYear();
    }, [year, page, isAdult]);

    const fetchMoviesByYear = async () => {
        setLoading(true);
        try {
            const res = await api.get('/movies/discover', {
                params: {
                    year: year,
                    page: page,
                    isAdult: isAdult,
                }
            });
            setMovies(res.data.results);
            setTotalPages(res.data.total_pages > 500 ? 500 : res.data.total_pages);
        } catch (error) {
            console.error('Gagal fetch movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    const handleLoadMore = () => {
        if (page < totalPages) {
            setPage(page + 1);
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
    };

    if (loading && page === 1) {
        return (
            <div className="genre-loading">
                <Spinner animation="border" variant="warning" />
                <p className="mt-3 text-light">Memuat film tahun {year}...</p>
            </div>
        );
    }

    return (
        <div className="genre-page">
            <Container className="py-4">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-4">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
                        Home
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>Tahun: {year}</Breadcrumb.Item>
                </Breadcrumb>

                {/* Header */}
                <div className="genre-header mb-4">
                    <h1 className="text-light fw-bold">Film {year}</h1>
                    <Badge bg="warning" text="dark" className="fs-6">
                        {movies.length} film ditemukan
                    </Badge>
                </div>

                {/* Movies Grid */}
                <Row className="g-3 justify-content-start">
                    {movies.map((movie) => (
                        <Col xs={6} sm={4} md={3} lg={2} key={movie.id}>
                            {/* Kita panggil komponen helper di sini */}
                            <YearMovieCard movie={movie} onClick={handleCardClick} />
                        </Col>
                    ))}
                </Row>

                {/* Load More Button */}
                {page < totalPages && (
                    <div className="text-center mt-4">
                        <button
                            className="btn btn-warning px-5"
                            onClick={handleLoadMore}
                            disabled={loading}
                        >
                            {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
                        </button>
                    </div>
                )}
            </Container>
        </div>
    );
}