import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ReviewTable = ({ reviews, onDelete }) => {
    return (
        <div className="table-responsive">
            <h4 className="mb-3">Semua Review Masuk</h4>
            <Table striped hover variant="dark" className="custom-table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>User</th>
                        <th>Film ID (Link)</th>
                        <th>Rating</th>
                        <th>Komentar</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review) => (
                        <tr key={review._id}>
                            <td style={{ fontSize: '0.85rem' }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </td>
                            <td>{review.user?.username || 'Unknown'}</td>
                            <td>
                                {/* Link ke halaman detail film */}
                                <Link 
                                    to={`/movie/${review.tmdbMovieId}`} 
                                    className="text-decoration-none text-warning"
                                    target="_blank" 
                                >
                                    {review.tmdbMovieId} 
                                    <i className="bi bi-box-arrow-up-right ms-1" style={{fontSize: '10px'}}></i>
                                </Link>
                            </td>
                            <td>
                                <span className="text-warning">★ {review.rating}</span>
                            </td>
                            <td style={{ maxWidth: '300px' }} className="text-truncate">
                                {review.comment}
                            </td>
                            <td>
                                <Button 
                                    variant="danger" 
                                    size="sm"
                                    onClick={() => onDelete(review._id)}
                                >
                                    Hapus
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ReviewTable;