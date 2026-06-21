import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { StarFill } from "react-bootstrap-icons";
import api from "../../api/api";
import '../../styles/movieCard.css';

export default function MovieCard({ movie }) {
    const [localRating, setLocalRating] = useState({ avg: 0, count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; // Prevent state update if unmounted

        const fetchRating = async () => {
            if (!movie?.id) {
                console.warn('⚠️ Movie ID is missing');
                setLoading(false);
                return;
            }

            try {
                console.log('🎬 Fetching rating for:', movie.title, '| ID:', movie.id);
                const res = await api.get(`/reviews/stats/${movie.id}`);
                console.log('📊 Response:', res.data);
                
                if (isMounted) {
                    setLocalRating({
                        avg: res.data.average || 0,
                        count: res.data.count || 0
                    });
                }
            } catch (err) {
                console.error('❌ Error fetching rating for', movie.title, ':', err);
                if (isMounted) {
                    setLocalRating({ avg: 0, count: 0 });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        fetchRating();

        return () => {
            isMounted = false; // Cleanup
        };
    }, [movie.id, movie.title]);

    const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";

    return (
        <Card className="movie-card h-100 shadow border-0">
            <Card.Img
                variant="top"
                src={poster}
                alt={movie.title}
                className="movie-card-img"
            />
            <Card.Body className="movie-card-body d-flex flex-column">
                <Card.Title className="movie-card-title text-truncate fw-bold mb-2">
                    {movie.title}
                </Card.Title>
                <Card.Text className="mb-2">
                    <small className="text-muted">
                        {movie.release_date?.slice(0, 4) || 'N/A'}
                    </small>
                </Card.Text>

                <div className="movie-rating d-flex align-items-center mb-3">
                    <StarFill
                        color={localRating.avg > 0 ? "#ffc107" : "#e4e5e9"}
                        className="me-1"
                    />
                    <span className="fw-bold me-2">
                        {loading ? '...' : (localRating.avg > 0 ? localRating.avg.toFixed(1) : '0.0')}
                    </span>
                    <small className="text-muted">
                        ({localRating.count || 0})
                    </small>
                </div>

                <Link to={`/movies/${movie.id}`} className="mt-auto">
                    <Button className="movie-detail-btn w-100 fw-bold">
                        Detail Film
                    </Button>
                </Link>
            </Card.Body>
        </Card>
    );
}