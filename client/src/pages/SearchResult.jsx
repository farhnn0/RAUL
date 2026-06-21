import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Card } from 'react-bootstrap';
import api from '../api/api';
import { ArrowLeft, Search as SearchIcon, PersonVideo, StarFill, Calendar } from 'react-bootstrap-icons';
import '../styles/searchResult.css';
import '../styles/GenrePage.css';

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// === KOMPONEN KECIL UNTUK FETCH RATING ===
// Ini persis seperti MovieCard tapi tampilannya sesuai permintaanmu
const MovieCardWithRating = ({ movie, onClick }) => {
    const [rating, setRating] = useState({ avg: 0, count: 0 });

    useEffect(() => {
        if (!movie?.id) return;
        const fetchRating = async () => {
            try {
                const res = await api.get(`/reviews/stats/${movie.id}`);
                if (res.data) {
                    setRating({ avg: res.data.average || 0, count: res.data.count || 0 });
                }
            } catch (err) { /* silent error */ }
        };
        fetchRating();
    }, [movie.id]);

    return (
        <Card className="movie-card" onClick={() => onClick(movie.id)}>
            <div className="poster-wrapper">
                <Card.Img
                    variant="top"
                    src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={movie.title}
                />
                <div className="rating-overlay">
                    <StarFill size={12} className="me-1" />
                    {/* Tampilkan Rating dari Database */}
                    <span>{rating.avg > 0 ? rating.avg.toFixed(1) : '0.0'}</span>
                </div>
            </div>
            <Card.Body className="p-2">
                <h6 className="movie-title text-light mb-1">{movie.title}</h6>
                <div className="movie-year text-secondary">
                    <Calendar size={10} className="me-1" />
                    {movie.release_date?.slice(0, 4) || 'N/A'}
                </div>
            </Card.Body>
        </Card>
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
                const res = await api.get('/movies/search', {
                    params: { query, isAdult }
                });

                const data = res.data;
                setSearchData({
                    resultsByTitle: data.resultsByTitle || [],
                    resultsByActor: data.resultsByActor || [],
                    actorName: data.actorName
                });

                if (
                    (!data.resultsByTitle || data.resultsByTitle.length === 0) &&
                    (!data.resultsByActor || data.resultsByActor.length === 0)
                ) {
                    setError(`Tidak ada hasil untuk pencarian "${query}"`);
                }
            } catch (error) {
                console.error("Gagal mencari film:", error);
                setError("Terjadi kesalahan saat mencari film");
                setSearchData({ resultsByTitle: [], resultsByActor: [], actorName: null });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, isAdult]);

    const handleCardClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    if (isLoading) {
        return (
            <div className="genre-loading">
                <Spinner animation="border" variant="warning" />
                <p className="mt-3 text-light">Mencari film "{query}"...</p>
            </div>
        );
    }

    return (
        <div className="genre-page">
            <Container className="py-4">
                <div className="search-header mb-4 d-flex flex-column gap-3">
                    <button className="search-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} /> <span>Kembali</span>
                    </button>

                    <div className="d-flex align-items-center gap-3">
                        <div className="search-icon-wrapper">
                            <SearchIcon size={32} />
                        </div>
                        <div>
                            <h1 className="text-light fw-bold m-0">Hasil Pencarian</h1>
                            <p className="search-query m-0">
                                "{query}" {isAdult === 'true' && <span className="badge bg-danger ms-2">18+</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="search-empty-state text-center">
                        <div className="search-empty-icon fs-1 mb-3">🎬</div>
                        <h3 className="search-empty-title text-light">Tidak Ada Hasil</h3>
                        <p className="search-empty-text text-muted">{error}</p>
                        <button className="btn btn-outline-warning mt-3" onClick={() => navigate('/')}>
                            Kembali ke Beranda
                        </button>
                    </div>
                ) : (
                    <div className="search-results-content">
                        {/* BAGIAN 1: JUDUL */}
                        {searchData.resultsByTitle.length > 0 && (
                            <section className="mb-5">
                                <h4 className="text-warning mb-3 border-bottom border-secondary pb-2">
                                    Berdasarkan Judul Film
                                </h4>
                                <Row className="g-3 justify-content-start">
                                    {searchData.resultsByTitle.map((movie) => (
                                        <Col key={movie.id} xs={6} sm={4} md={3} lg={2}>
                                            {/* Panggil komponen custom kita */}
                                            <MovieCardWithRating movie={movie} onClick={handleCardClick} />
                                        </Col>
                                    ))}
                                </Row>
                            </section>
                        )}

                        {/* BAGIAN 2: AKTOR */}
                        {searchData.resultsByActor.length > 0 && (
                            <section>
                                <h4 className="text-info mb-3 border-bottom border-secondary pb-2 d-flex align-items-center">
                                    <PersonVideo className="me-2" />
                                    Film yang dibintangi: {searchData.actorName}
                                </h4>
                                <Row className="g-3 justify-content-start">
                                    {searchData.resultsByActor.map((movie) => (
                                        <Col key={movie.id} xs={6} sm={4} md={3} lg={2}>
                                            {/* Panggil komponen custom kita */}
                                            <MovieCardWithRating movie={movie} onClick={handleCardClick} />
                                        </Col>
                                    ))}
                                </Row>
                            </section>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
};

export default SearchResult;