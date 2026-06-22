import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import api from "../api/api";
import toast from 'react-hot-toast';

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

/* ── Star Rating Input ── */
const StarRating = ({ rating, setRating, hover, setHover, disabled }) => (
    <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" disabled={disabled}
                onClick={() => !disabled && setRating(value)}
                onMouseEnter={() => !disabled && setHover(value)}
                onMouseLeave={() => !disabled && setHover(0)}
                className="text-3xl transition-colors cursor-pointer bg-transparent border-none p-0"
                style={{ color: value <= (hover || rating) ? "#D4A017" : "#4b5563" }}
            >★</button>
        ))}
    </div>
);

export default function MyReviews() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) { toast.error("Silakan login terlebih dahulu"); navigate("/signin"); return; }
        fetchMyReviews();
    }, [user, navigate]);

    const fetchMyReviews = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reviews/my-reviews');
            const reviewsWithMovies = await Promise.all(
                res.data.map(async (review) => {
                    try { return { ...review, movie: (await api.get(`/movies/${review.tmdbMovieId}`)).data }; }
                    catch (error) { return { ...review, movie: null }; }
                })
            );
            setReviews(reviewsWithMovies);
        } catch (error) {
            toast.error("Gagal memuat review Anda");
        } finally { setLoading(false); }
    };

    const handleEdit = (review, e) => {
        e.stopPropagation();
        setEditingReview(review);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editRating === 0) { toast.error("Harap isi rating!"); return; }
        if (!editComment.trim()) { toast.error("Harap isi ulasan!"); return; }
        setIsSaving(true);
        try {
            await api.put(`/reviews/${editingReview._id}`, { rating: editRating, comment: editComment });
            setReviews(prev => prev.map(r => r._id === editingReview._id ? { ...r, rating: editRating, comment: editComment } : r));
            setShowEditModal(false);
            toast.success('Review berhasil diupdate! 🎉');
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal update review");
        } finally { setIsSaving(false); }
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/reviews/${reviewToDelete}`);
            setReviews(prev => prev.filter(r => r._id !== reviewToDelete));
            toast.success("Review berhasil dihapus!");
            setShowDeleteModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal menghapus review");
        } finally { setIsDeleting(false); setReviewToDelete(null); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                <p className="mt-4 text-text-secondary">Loading reviews...</p>
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
                        <h1 className="text-3xl font-heading font-bold text-text-primary">My Reviews</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            <span className="text-primary font-bold">{reviews.length}</span> films reviewed
                        </p>
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="bg-surface-card border border-outline-variant/60 rounded-2xl p-16 text-center">
                        <span className="material-symbols-outlined text-[64px] text-text-muted mb-4">rate_review</span>
                        <h3 className="text-xl font-heading font-bold text-text-primary mb-3">No Reviews Yet</h3>
                        <p className="text-text-secondary mb-6">Start rating and reviewing your favorite films!</p>
                        <button onClick={() => navigate("/")} className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider">
                            Explore Films
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-surface-card border border-outline-variant/60 rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:border-primary/30 transition-all" onClick={() => navigate(`/movie/${review.tmdbMovieId}`)}>
                                <div className="relative">
                                    <div className="aspect-[2/3] overflow-hidden">
                                        <img
                                            src={review.movie?.poster_path ? `${TMDB_IMAGE_BASE}${review.movie.poster_path}` : "https://via.placeholder.com/500x750/1D232C/A7AFBA?text=No+Image"}
                                            alt={review.movie?.title || "Movie"}
                                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="absolute top-3 right-3 bg-background/85 backdrop-blur-sm px-2 py-0.5 rounded text-primary text-xs font-bold flex items-center gap-1 border border-primary/30">
                                        <span className="material-symbols-outlined text-[12px] fill-icon text-primary">star</span>
                                        {review.rating.toFixed(1)}
                                    </div>
                                    <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleEdit(review, e)} className="bg-primary/90 text-on-primary p-2 rounded-lg hover:bg-primary transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setReviewToDelete(review._id); setShowDeleteModal(true); }} className="bg-red-600/90 text-white p-2 rounded-lg hover:bg-red-700 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-sm font-heading font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                                        {review.movie?.title || "Unknown Movie"}
                                    </h3>
                                    <div className="flex gap-0.5 my-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <span key={i} className="material-symbols-outlined text-[12px]" style={{ color: i <= review.rating ? "#D4A017" : "#4b5563", fontVariationSettings: "'FILL' 1" }}>star</span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-text-muted italic line-clamp-3">"{review.comment}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isSaving && setShowEditModal(false)} />
                    <div className="relative bg-surface-card border border-outline-variant/60 rounded-2xl w-full max-w-md p-8 shadow-2xl z-10">
                        <h3 className="text-xl font-heading font-bold text-text-primary text-center mb-6">Edit Review</h3>
                        <form onSubmit={handleEditSubmit} className="flex flex-col items-center">
                            <p className="text-text-secondary text-sm mb-3">Update your rating</p>
                            <StarRating rating={editRating} setRating={setEditRating} hover={hoverRating} setHover={setHoverRating} disabled={isSaving} />
                            <textarea rows={4} placeholder="Update your review..."
                                value={editComment} onChange={(e) => setEditComment(e.target.value)}
                                className="w-full bg-surface border border-outline-variant/60 rounded-lg p-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none text-sm mt-3"
                                disabled={isSaving}
                            />
                            <div className="flex gap-3 w-full mt-6">
                                <button type="button" onClick={() => setShowEditModal(false)} disabled={isSaving} className="flex-1 py-2.5 border border-outline-variant/60 rounded-lg text-text-secondary text-sm font-semibold">Cancel</button>
                                <button type="submit" disabled={isSaving} className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-gold-hover disabled:opacity-50">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)} />
                    <div className="relative bg-surface-card border border-outline-variant/60 rounded-2xl w-full max-w-sm p-8 shadow-2xl z-10 text-center">
                        <span className="material-symbols-outlined text-[48px] text-primary mb-4">warning</span>
                        <h3 className="text-xl font-heading font-bold text-text-primary mb-2">Delete Review?</h3>
                        <p className="text-text-secondary text-sm mb-6">This action cannot be undone.</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="w-full py-2.5 border border-outline-variant/60 rounded-lg text-text-secondary font-semibold text-sm">Cancel</button>
                            <button onClick={confirmDelete} disabled={isDeleting} className="w-full py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700">{isDeleting ? "Deleting..." : "Yes, Delete"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
