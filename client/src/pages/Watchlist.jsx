import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import api from "../api/api"; 
import axios from "axios";
import toast from 'react-hot-toast';
import {
    Container,
    Row,
    Col,
    Card,
    Spinner,
    Button,
    Badge,
    Modal, // Import Modal
} from "react-bootstrap";
import { StarFill, Trash, ArrowLeft, Calendar, Bookmark, ExclamationCircle } from "react-bootstrap-icons";
import '../styles/Watchlist.css';

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// === Komponen Helper untuk Card Watchlist ===
const WatchlistCard = ({ movie, onClick, onRemove }) => {
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

    const getRatingColor = (val) => {
        if (val >= 4.5) return "#10b981";
        if (val >= 3.5) return "#ffc107";
        if (val >= 2.5) return "#ff9800";
        return "#ef4444";
    };

    return (
        <Card
            className="review-card h-100"
            onClick={() => onClick(movie.id)}
            role="button"
            tabIndex={0}
        >
            <div className="poster-container">
                <Card.Img
                    variant="top"
                    src={
                        movie.poster_path
                            ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
                            : "https://via.placeholder.com/500x750?text=No+Image"
                    }
                    alt={movie.title}
                    className="poster-image"
                />

                <div className="poster-gradient" />

                <div
                    className="rating-badge"
                    style={{
                        background: `linear-gradient(135deg, ${getRatingColor(rating.avg)}dd, ${getRatingColor(rating.avg)}ff)`
                    }}
                >
                    <StarFill size={18} color="#fff" className="me-2" />
                    <span className="text-white fw-bold fs-6">
                        {rating.avg > 0 ? rating.avg.toFixed(1) : '0.0'}
                    </span>
                </div>

                {/* Tombol Delete memicu fungsi onRemove dari Parent */}
                <Button
                    variant="danger"
                    size="sm"
                    className="delete-button"
                    onClick={(e) => onRemove(movie.id, e)}
                >
                    <Trash size={18} />
                </Button>
            </div>

            <Card.Body className="d-flex flex-column p-4">
                <h5 className="movie-title text-light fw-bold mb-3">
                    {movie.title}
                </h5>

                <div className="review-date d-flex align-items-center mb-3 text-secondary">
                    <Calendar size={14} className="me-2" />
                    <span>
                        {movie.release_date ?
                            new Date(movie.release_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            }) : 'N/A'
                        }
                    </span>
                </div>
            </Card.Body>

            <div
                className="bottom-accent"
                style={{
                    background: `linear-gradient(90deg, ${getRatingColor(rating.avg)}, transparent)`
                }}
            />
        </Card>
    );
};

export default function Watchlist() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [watchlistMovies, setWatchlistMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk Modal Hapus
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [movieToDelete, setMovieToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!user) {
            toast.error("Silakan login terlebih dahulu");
            navigate("/signin");
            return;
        }
        fetchWatchlist();
    }, [user, navigate]);

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/watchlist/me');
            const movieIds = res.data;

            if (movieIds.length === 0) {
                setWatchlistMovies([]);
                setLoading(false);
                return;
            }

            const moviesWithDetails = await Promise.all(
                movieIds.map(async (movieId) => {
                    try {
                        const movieRes = await api.get(`/movies/${movieId}`);
                        return movieRes.data;
                    } catch (error) {
                        console.error(`Gagal fetch movie ${movieId}:`, error);
                        return null;
                    }
                })
            );

            setWatchlistMovies(moviesWithDetails.filter(movie => movie !== null));
        } catch (error) {
            console.error("Gagal ambil watchlist:", error);
            toast.error("Gagal memuat watchlist");
        } finally {
            setLoading(false);
        }
    };

    // 1. Fungsi saat tombol sampah diklik (Hanya membuka modal)
    const initiateDelete = (movieId, e) => {
        e.stopPropagation();
        setMovieToDelete(movieId);
        setShowDeleteModal(true);
    };

    // 2. Fungsi Eksekusi Hapus (Saat tombol "Hapus" di modal diklik)
    const confirmDelete = async () => {
        if (!movieToDelete) return;

        setIsDeleting(true);
        try {
            await api.post('/users/watchlist/toggle', { tmdbMovieId: movieToDelete });
            
            // Update UI
            setWatchlistMovies(watchlistMovies.filter(movie => movie.id !== movieToDelete));
            toast.success("Film dihapus dari watchlist");
            setShowDeleteModal(false); // Tutup modal
        } catch (error) {
            console.error("Gagal hapus dari watchlist:", error);
            toast.error("Gagal menghapus dari watchlist");
        } finally {
            setIsDeleting(false);
            setMovieToDelete(null);
        }
    };

    // Fungsi Tutup Modal
    const handleCloseModal = () => {
        if (!isDeleting) {
            setShowDeleteModal(false);
            setMovieToDelete(null);
        }
    };

    const handleCardClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    if (loading) {
        return (
            <div className="my-reviews-loading">
                <div className="text-center">
                    <Spinner animation="border" className="loading-spinner" />
                    <p className="mt-4 text-light fs-5 fw-light">Memuat watchlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-reviews-page">
            <div className="background-decoration" />

            <Container className="py-5 position-relative">
                {/* Header Section */}
                <Row className="mb-5">
                    <Col>
                        <Button 
                            variant="outline-light" 
                            onClick={() => navigate(-1)}
                            className="back-button mb-4"
                        >
                            <ArrowLeft className="me-2" size={20} />
                            Kembali
                        </Button>
                        
                        <div className="d-flex align-items-center mb-3">
                            <div className="accent-bar" />
                            <div>
                                <h1 className="page-title text-light fw-bold mb-2">
                                    Watchlist Saya
                                </h1>
                                <div className="d-flex align-items-center gap-3">
                                    <Badge bg="warning" text="dark" className="review-badge">
                                        <Bookmark className="me-2" size={16} />
                                        {watchlistMovies.length} Film
                                    </Badge>
                                    <p className="text-secondary mb-0 fw-light">
                                        Film yang ingin ditonton
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {watchlistMovies.length === 0 ? (
                    <div className="empty-state text-center py-5">
                        <div className="empty-icon">
                            <Bookmark size={60} color="#ffc107" />
                        </div>
                        <h3 className="text-light fw-bold mb-3">Watchlist Kosong</h3>
                        <p className="text-secondary mb-4 fs-5">
                            Tambahkan film yang ingin Anda tonton nanti!
                        </p>
                        <Button 
                            variant="warning" 
                            onClick={() => navigate("/")}
                            className="explore-button px-5 py-3 fw-bold"
                        >
                            Jelajahi Film
                        </Button>
                    </div>
                ) : (
                    <Row className="g-3 justify-content-start">
                        {watchlistMovies.map((movie) => (
                            <Col xs={12} sm={6} lg={4} xl={3} key={movie.id}>
                                <WatchlistCard
                                    movie={movie}
                                    onClick={handleCardClick}
                                    onRemove={initiateDelete} // Panggil fungsi buka modal
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            {/* === MODAL KONFIRMASI HAPUS (Layout Centered) === */}
            <Modal 
                show={showDeleteModal} 
                onHide={handleCloseModal}
                centered // Ini agar modal muncul di tengah layar secara vertikal
                backdrop="static" // Agar tidak keluar jika klik di luar (opsional, biar fokus)
                keyboard={false}
                className="delete-modal-custom" // Class khusus untuk CSS tambahan
                data-bs-theme="dark"
            >
                <Modal.Header closeButton={!isDeleting} className="border-0 pb-0 justify-content-center">
                    {/* Icon Besar di Tengah Atas (Opsional, gaya modern) */}
                    <div className="w-100 text-center mb-2">
                        <ExclamationCircle className="text-warning" size={60} />
                    </div>
                </Modal.Header>

                <Modal.Body className="text-light text-center pt-0 px-4">
                    <h4 className="fw-bold mb-3">Konfirmasi Hapus</h4>
                    <p className="text-secondary mb-0">
                        Apakah Anda yakin ingin menghapus film ini dari watchlist Anda?
                    </p>
                </Modal.Body>

                <Modal.Footer className="border-0 d-flex flex-column gap-2 px-4 pb-4">
                    {/* Tombol Disusun Vertikal (Stacked) agar "Pas di Tengah" */}
                    <Button 
                        variant="secondary" 
                        onClick={handleCloseModal}
                        disabled={isDeleting}
                        className="w-100 py-2 fw-semibold rounded-pill" // w-100 bikin full width
                    >
                        Batal
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={confirmDelete}
                        disabled={isDeleting}
                        className="w-100 py-2 fw-bold rounded-pill"
                    >
                        {isDeleting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                Menghapus...
                            </>
                        ) : (
                            "Ya, Hapus"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}