import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import api from "../api/api";
import toast from 'react-hot-toast';
import {
    Container,
    Row,
    Col,
    Card,
    Spinner,
    Button,
    Badge,
    Modal,
    Form,
} from "react-bootstrap";
import { StarFill, Trash, ArrowLeft, Calendar, Film, PencilSquare, ExclamationCircle } from "react-bootstrap-icons";
import { FaStar } from "react-icons/fa";
import '../styles/MyReviews.css';
import '../styles/Watchlist.css'; // Kita reuse CSS modal dari watchlist agar konsisten

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function MyReviews() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk Hapus Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State untuk Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            toast.error("Silakan login terlebih dahulu");
            navigate("/signin");
            return;
        }
        fetchMyReviews();
    }, [user, navigate]);

    const fetchMyReviews = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reviews/my-reviews');
            
            const reviewsWithMovies = await Promise.all(
                res.data.map(async (review) => {
                    try {
                        const movieRes = await api.get(`/movies/${review.tmdbMovieId}`);
                        return { ...review, movie: movieRes.data };
                    } catch (error) {
                        console.error(`Gagal fetch movie ${review.tmdbMovieId}:`, error);
                        return { ...review, movie: null };
                    }
                })
            );
            setReviews(reviewsWithMovies);
        } catch (error) {
            console.error("Gagal ambil review:", error);
            toast.error("Gagal memuat review Anda");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIKA EDIT ---
    const handleEdit = (review, e) => {
        e.stopPropagation();
        setEditingReview(review);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        
        if (editRating === 0) {
            toast.error("Harap isi rating bintang!");
            return;
        }
        if (!editComment.trim()) {
            toast.error("Harap isi ulasan Anda!");
            return;
        }

        setIsSaving(true);
        try {
            await api.put(`/reviews/${editingReview._id}`, {
                rating: editRating,
                comment: editComment,
            });

            setReviews(reviews.map(rev => 
                rev._id === editingReview._id 
                    ? { ...rev, rating: editRating, comment: editComment }
                    : rev
            ));

            setShowEditModal(false);
            toast.success('Review berhasil diupdate! 🎉');
        } catch (error) {
            console.error("Gagal update review:", error);
            toast.error(error.response?.data?.message || "Gagal mengupdate review");
        } finally {
            setIsSaving(false);
        }
    };

    // --- LOGIKA HAPUS (MODAL) ---
    const initiateDelete = (reviewId, e) => {
        e.stopPropagation();
        setReviewToDelete(reviewId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/reviews/${reviewToDelete}`);
            setReviews(reviews.filter(rev => rev._id !== reviewToDelete));
            toast.success("Review berhasil dihapus!");
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Gagal hapus review:", error);
            toast.error(error.response?.data?.message || "Gagal menghapus review");
        } finally {
            setIsDeleting(false);
            setReviewToDelete(null);
        }
    };

    const handleCloseDeleteModal = () => {
        if (!isDeleting) {
            setShowDeleteModal(false);
            setReviewToDelete(null);
        }
    };

    const handleCardClick = (tmdbMovieId) => {
        navigate(`/movie/${tmdbMovieId}`);
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return "#10b981";
        if (rating >= 3.5) return "#ffc107";
        if (rating >= 2.5) return "#ff9800";
        return "#ef4444";
    };

    if (loading) {
        return (
            <div className="my-reviews-loading">
                <div className="text-center">
                    <Spinner animation="border" className="loading-spinner" />
                    <p className="mt-4 text-light fs-5 fw-light">Memuat review Anda...</p>
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
                                    Review Saya
                                </h1>
                                <div className="d-flex align-items-center gap-3">
                                    <Badge bg="warning" text="dark" className="review-badge">
                                        <Film className="me-2" size={16} />
                                        {reviews.length} Review
                                    </Badge>
                                    <p className="text-secondary mb-0 fw-light">
                                        Koleksi ulasan film Anda
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {reviews.length === 0 ? (
                    <div className="empty-state text-center py-5">
                        <div className="empty-icon">
                            <Film size={60} color="#ffc107" />
                        </div>
                        <h3 className="text-light fw-bold mb-3">Belum Ada Review</h3>
                        <p className="text-secondary mb-4 fs-5">
                            Mulai beri rating dan ulasan untuk film favorit Anda!
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
                        {reviews.map((review) => (
                            <Col xs={12} sm={6} lg={4} xl={3} key={review._id}>
                                <Card 
                                    className="review-card h-100"
                                    onClick={() => handleCardClick(review.tmdbMovieId)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="poster-container">
                                        <Card.Img
                                            variant="top"
                                            src={review.movie?.poster_path
                                                    ? `${TMDB_IMAGE_BASE}${review.movie.poster_path}`
                                                    : "https://via.placeholder.com/500x750?text=No+Image"
                                            }
                                            alt={review.movie?.title || "Movie"}
                                            className="poster-image"
                                        />
                                        <div className="poster-gradient" />
                                        
                                        {/* Rating Badge */}
                                        <div 
                                            className="rating-badge"
                                            style={{
                                                background: `linear-gradient(135deg, ${getRatingColor(review.rating)}dd, ${getRatingColor(review.rating)}ff)`
                                            }}
                                        >
                                            <StarFill size={18} color="#fff" className="me-2" />
                                            <span className="text-white fw-bold fs-6">
                                                {review.rating.toFixed(1)}
                                            </span>
                                        </div>

                                        {/* Edit Button */}
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="edit-button"
                                            onClick={(e) => handleEdit(review, e)}
                                        >
                                            <PencilSquare size={18} />
                                        </Button>

                                        {/* Delete Button (Memicu Modal) */}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="delete-button"
                                            onClick={(e) => initiateDelete(review._id, e)}
                                        >
                                            <Trash size={18} />
                                        </Button>
                                    </div>

                                    <Card.Body className="d-flex flex-column p-4">
                                        <h5 className="movie-title text-light fw-bold mb-3">
                                            {review.movie?.title || "Unknown Movie"}
                                        </h5>
                                        <div className="review-date d-flex align-items-center mb-3 text-secondary">
                                            <Calendar size={14} className="me-2" />
                                            <span>
                                                {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="comment-box">
                                            <Card.Text className="comment-text text-light mb-0">
                                                "{review.comment}"
                                            </Card.Text>
                                        </div>
                                    </Card.Body>

                                    <div 
                                        className="bottom-accent"
                                        style={{
                                            background: `linear-gradient(90deg, ${getRatingColor(review.rating)}, transparent)`
                                        }}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            {/* === MODAL EDIT REVIEW === */}
            <Modal
                show={showEditModal}
                onHide={() => !isSaving && setShowEditModal(false)}
                centered
                data-bs-theme="dark"
                className="edit-modal-custom"
            >
                <Modal.Header closeButton={!isSaving} className="border-secondary bg-dark text-light">
                    <Modal.Title className="fw-bold w-100 text-center">Edit Ulasan</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body className="bg-dark text-light d-flex flex-column align-items-center py-4">
                        <p className="text-secondary mb-3">Ubah rating Anda</p>
                        
                        {/* Star Rating Input */}
                        <div className="d-flex justify-content-center mb-4">
                            {[...Array(5)].map((_, index) => {
                                const ratingValue = index + 1;
                                return (
                                    <label key={index} style={{ cursor: "pointer" }}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={ratingValue}
                                            onClick={() => setEditRating(ratingValue)}
                                            style={{ display: "none" }}
                                            disabled={isSaving}
                                        />
                                        <FaStar
                                            size={32}
                                            color={ratingValue <= (hoverRating || editRating) ? "#ffc107" : "#4b5563"}
                                            onMouseEnter={() => !isSaving && setHoverRating(ratingValue)}
                                            onMouseLeave={() => !isSaving && setHoverRating(0)}
                                            className="mx-1 transition-colors"
                                        />
                                    </label>
                                );
                            })}
                        </div>

                        <Form.Group className="w-100 px-3">
                            <Form.Label className="text-light fw-semibold">Komentar Anda</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Tulis ulang ulasan Anda..."
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="bg-dark text-light border-secondary"
                                style={{ resize: "none" }}
                                disabled={isSaving}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-dark border-secondary px-4 py-3">
                        <div className="d-flex w-100 gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setShowEditModal(false)}
                                className="w-100"
                                disabled={isSaving}
                            >
                                Batal
                            </Button>
                            <Button 
                                variant="warning" 
                                type="submit"
                                className="w-100 fw-bold"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <><Spinner size="sm" className="me-2"/>Menyimpan...</>
                                ) : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* === MODAL KONFIRMASI HAPUS (Reuse Style Watchlist) === */}
            <Modal 
                show={showDeleteModal} 
                onHide={handleCloseDeleteModal}
                centered
                backdrop="static"
                keyboard={false}
                className="delete-modal-custom"
                data-bs-theme="dark"
            >
                <Modal.Header closeButton={!isDeleting} className="border-0 pb-0 justify-content-center">
                    <div className="w-100 text-center mb-2">
                        <ExclamationCircle className="text-warning" size={60} />
                    </div>
                </Modal.Header>

                <Modal.Body className="text-light text-center pt-0 px-4">
                    <h4 className="fw-bold mb-3">Hapus Review?</h4>
                    <p className="text-secondary mb-0">
                        Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                </Modal.Body>

                <Modal.Footer className="border-0 d-flex flex-column gap-2 px-4 pb-4">
                    <Button 
                        variant="secondary" 
                        onClick={handleCloseDeleteModal}
                        disabled={isDeleting}
                        className="w-100 py-2 fw-semibold rounded-pill"
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
                            "Ya, Hapus Review"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}