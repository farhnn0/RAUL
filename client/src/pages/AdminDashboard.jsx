import React, { useEffect, useState } from 'react';
import { Container, Nav, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchAllUsers, deleteUser, fetchAllReviews, deleteReview, updateUserRole } from '../api/adminService';

// Import Components
import DashboardStats from '../component/admin/DashboardStats';
import UserTable from '../component/admin/UserTable';
import ReviewTable from '../component/admin/ReviewTable';

import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // State Tab Aktif ('stats', 'users', 'reviews')
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data State
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [reviews, setReviews] = useState([]);

    // 1. Cek Otorisasi (Hanya Admin)
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/'); // Tendang ke home jika bukan admin
        } else {
            loadData();
        }
    }, [user, navigate]);

    // 2. Load Data sesuai kebutuhan
    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Kita load semua di awal untuk dashboard sederhana
            // Untuk app besar, sebaiknya load per tab (lazy load)
            const statsData = await fetchDashboardStats();
            const usersData = await fetchAllUsers();
            const reviewsData = await fetchAllReviews();

            setStats(statsData);
            setUsers(usersData);
            setReviews(reviewsData);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat data dashboard.");
        } finally {
            setLoading(false);
        }
    };

    // Handler Hapus User
    const handleDeleteUser = async (id) => {
        if (window.confirm("Yakin ingin menghapus user ini?")) {
            try {
                await deleteUser(id);
                setUsers(users.filter(u => u._id !== id)); // Update UI
                loadData(); // Reload stats
            } catch (err) {
                alert("Gagal menghapus user");
            }
        }
    };

    // Handler Ganti Role User
    const handleRoleChange = async (userId, newRole) => {
        // Konfirmasi agar tidak sengaja terpencet
        if (!window.confirm(`Ubah role user ini menjadi ${newRole}?`)) return;

        try {
            await updateUserRole(userId, newRole);
            
            // Update UI secara lokal (Optimistic UI) agar tidak perlu reload semua data
            setUsers(prevUsers => prevUsers.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
            
            alert(`Berhasil mengubah role menjadi ${newRole}`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Gagal mengubah role");
            // Jika gagal, reload data agar sinkron kembali
            loadData();
        }
    };

    // Handler Hapus Review
    const handleDeleteReview = async (id) => {
        if (window.confirm("Hapus review ini?")) {
            try {
                await deleteReview(id);
                setReviews(reviews.filter(r => r._id !== id)); // Update UI
                loadData(); // Reload stats
            } catch (err) {
                alert("Gagal menghapus review");
            }
        }
    };


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
                <Spinner animation="border" variant="danger" />
            </div>
        );
    }

    return (
        <div className="admin-dashboard py-5">
            <Container>
                <h2 className="mb-4 fw-bold">Admin Dashboard</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Navigasi Tab */}
                <Nav variant="pills" className="mb-4 admin-tabs" activeKey={activeTab}>
                    <Nav.Item>
                        <Nav.Link eventKey="stats" onClick={() => setActiveTab('stats')}>
                            Overview
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="users" onClick={() => setActiveTab('users')}>
                            Manajemen User
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="reviews" onClick={() => setActiveTab('reviews')}>
                            Moderasi Review
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                {/* Konten Tab */}
                <div className="tab-content">
                    {activeTab === 'stats' && <DashboardStats stats={stats} />}
                    
                    {activeTab === 'users' && (
                        <UserTable users={users} onDelete={handleDeleteUser} onRoleChange={handleRoleChange} />
                    )}
                    
                    {activeTab === 'reviews' && (
                        <ReviewTable reviews={reviews} onDelete={handleDeleteReview} />
                    )}
                </div>

            </Container>
        </div>
    );
}