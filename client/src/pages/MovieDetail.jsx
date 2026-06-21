import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleWatchlistState } from "../redux/userSlice";
import { Dropdown } from "react-bootstrap";
import { ThreeDotsVertical, PencilSquare, Trash, ExclamationCircle } from "react-bootstrap-icons";
import api from "../api/api";
import toast from "react-hot-toast";
import { useAuth } from "../App.jsx";
import {
    Container,
    Row,
    Col,
    Button,
    Form,
    Spinner,
    Modal,
    Badge,
} from "react-bootstrap";
import {
    StarFill,
    EyeFill,
    HeartFill,
    ArrowLeft,
    BookmarkPlus,
    BookmarkCheckFill,
} from "react-bootstrap-icons";
import { FaStar } from "react-icons/fa";
import "../styles/MovieDetail.css";
import "../styles/Watchlist.css"; 

// === Custom Toggle (Supaya tidak ada segitiga/caret) ===
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <span
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}
        className="text-secondary p-2"
        style={{ cursor: "pointer", display: "inline-block" }}
    >
        {children}
    </span>
));

// Helper Functions
const isAscii = (str = "") => /^[\u0000-\u007F\s'".,:;-]+$/.test(str);

const getActorName = (actor = {}) => {
    const name = actor.name || "";
    const originalName = actor.original_name || "";
    if (isAscii(name) && name.trim() !== "") return name;
    if (isAscii(originalName) && originalName.trim() !== "") return originalName;
    return name || originalName || "Unknown";
};

const getMovieTitle = (movie) => {
    if (!movie) return "";
    const title = movie.title || "";
    const original = movie.original_title || "";
    if (isAscii(title) && title.trim() !== "") return title;
    if (isAscii(original) && original.trim() !== "") return original;
    return title;
};

// Komponen Star Rating
const StarRating = ({ rating, setRating, hover, setHover, disabled }) => {
    return (
        <div className="d-flex justify-content-center mb-3">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={index} style={{ cursor: disabled ? "default" : "pointer" }}>
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => !disabled && setRating(ratingValue)}
                            style={{ display: "none" }}
                            disabled={disabled}
                        />
                        <FaStar
                            size={32}
                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#4b5563"}
                            onMouseEnter={() => !disabled && setHover(ratingValue)}
                            onMouseLeave={() => !disabled && setHover(0)}
                            className="mx-1 transition-colors"
                        />
                    </label>
                );
            })}
        </div>
    );
};

export default function MovieDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { watchlist } = useSelector((state) => state.user);

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watchlistLoading, setWatchlistLoading] = useState(false);
    
    // Reviews State
    const [reviews, setReviews] = useState([]);
    
    // Modal Review (Add/Edit)
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal Delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const numericMovieId = Number(id);
    const isMovieInWatchlist = watchlist.includes(numericMovieId);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchMovieData();
    }, [id]);

    const fetchMovieData = async () => {
        // Jangan set loading true jika hanya refresh data di background
        if (!movie) setLoading(true); 
        try {
            const movieRes = await api.get(`/movies/${id}`);
            setMovie(movieRes.data);

            const reviewsRes = await api.get(`/reviews/movie/${id}`);
            setReviews(reviewsRes.data);
        } catch (error) {
            console.error("Gagal ambil data film:", error);
            // Jangan toast error jika ini hanya refresh background
            if (!movie) toast.error("Gagal memuat data film");
        } finally {
            setLoading(false);
        }
    };

    // --- WATCHLIST (Sudah Realtime) ---
    const handleToggleWatchlist = async () => {
        if (!user) {
            toast.error("Anda harus login untuk menambah watchlist");
            setTimeout(() => navigate("/signin", { state: { from: location } }), 1300);
            return;
        }

        setWatchlistLoading(true);
        try {
            await api.post("/users/watchlist/toggle", { tmdbMovieId: numericMovieId });
            dispatch(toggleWatchlistState(numericMovieId));
            
            // Realtime Update Count Watchlist
            setMovie((prev) => {
                const currentCount = prev.watchlistCount || 0;
                const newCount = isMovieInWatchlist ? Math.max(0, currentCount - 1) : currentCount + 1;
                return { ...prev, watchlistCount: newCount };
            });
            
            toast.success(isMovieInWatchlist ? "Dihapus dari Watchlist" : "Ditambahkan ke Watchlist");
        } catch (error) {
            toast.error("Gagal memperbarui watchlist");
        } finally {
            setWatchlistLoading(false);
        }
    };

    // --- MODAL HANDLERS ---
    const handleShowAddModal = () => {
        if (!user) {
            toast.error("Silakan login terlebih dahulu");
            setTimeout(() => navigate("/signin", { state: { from: location } }), 1300);
            return;
        }
        setEditingReviewId(null);
        setUserRating(0);
        setUserReview("");
        setShowReviewModal(true);
    };

    const handleShowEditModal = (review) => {
        setEditingReviewId(review._id);
        setUserRating(review.rating);
        setUserReview(review.comment);
        setShowReviewModal(true);
    };

    const handleCloseReviewModal = () => {
        if (!isSaving) {
            setShowReviewModal(false);
            setUserRating(0);
            setUserReview("");
            setHoverRating(0);
            setEditingReviewId(null);
        }
    };

    // --- SUBMIT REVIEW (ADD & EDIT - REALTIME) ---
    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (userRating === 0) {
            toast.error("Harap isi rating bintang!");
            return;
        }
        if (!userReview.trim()) {
            toast.error("Harap isi ulasan Anda!");
            return;
        }

        setIsSaving(true);
        try {
            if (editingReviewId) {
                // === EDIT MODE ===
                await api.put(`/reviews/${editingReviewId}`, {
                    rating: userRating,
                    comment: userReview,
                });

                // 1. Update List Review secara Instant
                setReviews((prev) =>
                    prev.map((r) =>
                        r._id === editingReviewId
                            ? { ...r, rating: userRating, comment: userReview }
                            : r
                    )
                );
                
                // 2. Fetch ulang data film untuk update Average Rating (Bintang di atas)
                fetchMovieData(); 

                toast.success("Review berhasil diperbarui 🎉");
            } else {
                // === ADD MODE ===
                const res = await api.post("/reviews", {
                    tmdbMovieId: id,
                    rating: userRating,
                    comment: userReview,
                });

                // 1. Tambah ke List Review Instant
                setReviews([res.data, ...reviews]);
                
                // 2. Update Stats Film Instant (Optimistic UI)
                setMovie((prev) => {
                    const oldCount = prev.vote_count || 0;
                    const oldAvg = prev.vote_average || 0;
                    const newCount = oldCount + 1;
                    // Hitung rata-rata baru secara manual agar instant
                    const newAvg = ((oldAvg * oldCount) + userRating) / newCount;
                    return { ...prev, vote_count: newCount, vote_average: newAvg };
                });

                toast.success("Review berhasil dikirim 🎉");
            }
            handleCloseReviewModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal menyimpan review");
        } finally {
            setIsSaving(false);
        }
    };

    // --- DELETE REVIEW (REALTIME) ---
    const initiateDelete = (reviewId) => {
        setReviewToDelete(reviewId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/reviews/${reviewToDelete}`);
            
            // 1. Hapus dari list di layar (Instant)
            setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete));
            
            // 2. Kurangi jumlah review di info film (Instant)
            setMovie((prev) => ({
                ...prev,
                vote_count: Math.max(0, (prev.vote_count || 0) - 1)
            }));

            // 3. Fetch ulang data film agar Rating Rata-rata (Bintang) ter-update akurat
            fetchMovieData(); 

            toast.success("Review berhasil dihapus");
            setShowDeleteModal(false);
        } catch (error) {
            toast.error("Gagal menghapus review");
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

    // --- RENDER HELPERS ---
    const director = movie?.credits?.crew?.find((p) => p.job === "Director")?.name || "N/A";
    const mainCast = movie?.credits?.cast ? movie.credits.cast.slice(0, 3) : [];
    
    const getAgeRating = () => {
        if (!movie) return "N/A";
        const releases = movie.release_dates?.results || [];
        const found = releases.find((r) => r.iso_3166_1 === "ID") || releases.find((r) => r.iso_3166_1 === "US") || releases[0];
        const cert = found?.release_dates?.find((d) => d.certification)?.certification;
        
        if (!cert) return "N/A";
        if (cert.match(/\d+/)) return `${parseInt(cert.match(/\d+/)[0])}+`;
        return cert;
    };

    if (loading) {
        return (
            <div className="text-center mt-5 movie-detail-state-container">
                <Spinner animation="border" variant="warning" />
                <p className="mt-3 text-light">Memuat detail film...</p>
            </div>
        );
    }

    if (!movie) return null;

    return (
        <div
            className="movie-detail-wrapper"
            style={{
                backgroundImage: movie.backdrop_path
                    ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                    : `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`,
            }}
        >
            <div className="movie-detail-overlay"></div>

            <Container className="py-5 movie-detail-content">
                <Row className="align-items-center">
                    {/* Poster & Stats */}
                    <Col md={4} className="text-center mb-4">
                        <img
                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/300x450?text=No+Image"}
                            alt={movie.title}
                            className="rounded shadow-lg movie-poster-img"
                        />
                        <div className="d-flex justify-content-center gap-3 mt-3">
                            <div><EyeFill size={20} className="text-success" /> <small>{movie.watchlistCount || 0} Watchlists</small></div>
                            <div><HeartFill size={18} className="text-danger" /> <small>{movie.vote_count || 0} Reviews</small></div>
                            <div><StarFill size={18} className="text-warning" /> <small>{movie.vote_average?.toFixed(1) || "0.0"}</small></div>
                        </div>
                    </Col>

                    {/* Info Film */}
                    <Col md={8}>
                        <h1 className="fw-bold">{getMovieTitle(movie)}</h1>
                        <p className="text-secondary mb-1">
                            {movie.release_date?.slice(0, 4)} • Directed by <span className="text-info">{director}</span>
                        </p>

                        <div className="d-flex flex-wrap gap-3 small text-secondary mb-2">
                            <span><strong>Durasi:</strong> {movie.runtime ? `${movie.runtime} menit` : "N/A"}</span>
                            <span><strong>Rating Umur:</strong> {getAgeRating()}</span>
                            <span><strong>Bahasa:</strong> {movie.original_language?.toUpperCase()}</span>
                        </div>

                        <p className="text-secondary mb-3">
                            <strong>Pemeran utama:</strong>{" "}
                            {mainCast.length > 0 ? mainCast.map(a => getActorName(a)).join(", ") : "N/A"}
                        </p>

                        {movie.tagline && <p className="text-uppercase fw-bold text-warning mb-3">{movie.tagline}</p>}
                        <p className="movie-overview">{movie.overview || "Tidak ada deskripsi."}</p>

                        {movie.genres?.length > 0 && (
                            <div className="mb-3">
                                {movie.genres.map((g) => (
                                    <span key={g.id} className="badge bg-secondary me-2 genre-badge">{g.name}</span>
                                ))}
                            </div>
                        )}

                        <div className="d-flex gap-3 my-4 flex-wrap">
                            <Button variant="outline-light" onClick={handleShowAddModal}>
                                <StarFill /> Rate
                            </Button>
                            <Button
                                variant={isMovieInWatchlist ? "warning" : "outline-light"}
                                onClick={handleToggleWatchlist}
                                disabled={watchlistLoading}
                            >
                                {watchlistLoading ? "Menyimpan..." : isMovieInWatchlist ? <><BookmarkCheckFill className="me-2"/>Hapus Watchlist</> : <><BookmarkPlus className="me-2"/>Tambah Watchlist</>}
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* --- BAGIAN REVIEW --- */}
                <Row className="mt-5">
                    <Col md={12}>
                        <h5 className="fw-bold text-light mb-3">Ulasan Pengguna</h5>
                        {reviews.length === 0 ? (
                            <p className="text-white">Belum ada ulasan. Jadilah yang pertama!</p>
                        ) : (
                            reviews.map((rev) => (
                                <div key={rev._id} className="p-3 mb-3 rounded review-card position-relative bg-dark bg-opacity-50">
                                    {/* MENU TITIK 3 (Dropdown) */}
                                    {user && (user._id === rev.user?._id || user.role === "admin") && (
                                        <Dropdown className="review-menu position-absolute top-0 end-0 mt-2 me-2" drop="start">
                                            {/* Pake as={CustomToggle} biar ga ada segitiga sama sekali */}
                                            <Dropdown.Toggle as={CustomToggle}>
                                                <ThreeDotsVertical size={20} />
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu variant="dark">
                                                <Dropdown.Item onClick={() => handleShowEditModal(rev)}>
                                                    <PencilSquare className="me-2" /> Edit
                                                </Dropdown.Item>
                                                <Dropdown.Item className="text-danger" onClick={() => initiateDelete(rev._id)}>
                                                    <Trash className="me-2" /> Hapus
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}

                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className="fw-bold text-warning">
                                            {rev.user?.displayName || rev.user?.username || "User"}
                                        </span>
                                        <div className="d-flex">
                                            {[...Array(5)].map((_, i) => (
                                                <StarFill key={i} size={14} color={i < rev.rating ? "#ffc107" : "#555"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-light mb-0">{rev.comment}</p>
                                </div>
                            ))
                        )}
                    </Col>
                </Row>
            </Container>

            {/* === MODAL ADD/EDIT REVIEW === */}
            <Modal show={showReviewModal} onHide={handleCloseReviewModal} centered data-bs-theme="dark" className="edit-modal-custom">
                <Modal.Header closeButton={!isSaving} className="border-secondary bg-dark text-light">
                    <Modal.Title className="w-100 text-center fw-bold">
                        {editingReviewId ? "Edit Ulasan" : "Beri Ulasan"}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleReviewSubmit}>
                    <Modal.Body className="bg-dark text-light d-flex flex-column align-items-center py-4">
                        <p className="text-secondary mb-3">Pilih Rating</p>
                        <StarRating rating={userRating} setRating={setUserRating} hover={hoverRating} setHover={setHoverRating} disabled={isSaving} />
                        <Form.Group className="w-100 px-3 mt-3">
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Bagikan pendapat Anda..."
                                value={userReview}
                                onChange={(e) => setUserReview(e.target.value)}
                                className="bg-dark text-light border-secondary"
                                style={{ resize: "none" }}
                                disabled={isSaving}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-dark border-secondary px-4 py-3">
                        <div className="d-flex w-100 gap-2">
                            <Button variant="outline-secondary" onClick={handleCloseReviewModal} className="w-100" disabled={isSaving}>Batal</Button>
                            <Button variant="warning" type="submit" className="w-100 fw-bold" disabled={isSaving}>
                                {isSaving ? <><Spinner size="sm" className="me-2"/>Menyimpan...</> : "Kirim Ulasan"}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* === MODAL DELETE CONFIRMATION === */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered backdrop="static" keyboard={false} className="delete-modal-custom" data-bs-theme="dark">
                <Modal.Header closeButton={!isDeleting} className="border-0 pb-0 justify-content-center">
                    <div className="w-100 text-center mb-2"><ExclamationCircle className="text-warning" size={60} /></div>
                </Modal.Header>
                <Modal.Body className="text-light text-center pt-0 px-4">
                    <h4 className="fw-bold mb-3">Hapus Review?</h4>
                    <p className="text-secondary mb-0">Tindakan ini tidak dapat dibatalkan.</p>
                </Modal.Body>
                <Modal.Footer className="border-0 d-flex flex-column gap-2 px-4 pb-4">
                    <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={isDeleting} className="w-100 py-2 fw-semibold rounded-pill">Batal</Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={isDeleting} className="w-100 py-2 fw-bold rounded-pill">
                        {isDeleting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>Menghapus...</> : "Ya, Hapus Review"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}