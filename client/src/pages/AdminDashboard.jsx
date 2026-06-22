import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchAllUsers, deleteUser, fetchAllReviews, deleteReview, updateUserRole } from '../api/adminService';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        loadData();
    }, [user, navigate]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsData, usersData, reviewsData] = await Promise.all([
                fetchDashboardStats(), fetchAllUsers(), fetchAllReviews()
            ]);
            setStats(statsData);
            setUsers(usersData);
            setReviews(reviewsData);
        } catch (err) {
            setError("Failed to load dashboard data.");
        } finally { setLoading(false); }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Delete this user?")) {
            try { await deleteUser(id); setUsers(users.filter(u => u._id !== id)); loadData(); }
            catch (err) { alert("Failed to delete user"); }
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Change role to ${newRole}?`)) return;
        try {
            await updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) { alert(err.response?.data?.message || "Failed to change role"); loadData(); }
    };

    const handleDeleteReview = async (id) => {
        if (window.confirm("Delete this review?")) {
            try { await deleteReview(id); setReviews(reviews.filter(r => r._id !== id)); loadData(); }
            catch (err) { alert("Failed to delete review"); }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    const tabs = [
        { key: 'stats', label: 'Overview', icon: 'dashboard' },
        { key: 'users', label: 'Users', icon: 'group' },
        { key: 'reviews', label: 'Reviews', icon: 'reviews' },
    ];

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="max-w-[1280px] mx-auto px-6 py-12">
                <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Admin Dashboard</h1>

                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">{error}</div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-outline-variant/40 pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all ${
                                activeTab === tab.key
                                    ? 'bg-surface-card border border-outline-variant/60 border-b-transparent text-primary'
                                    : 'text-text-muted hover:text-text-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { label: 'Total Users', value: stats.totalUsers || 0, icon: 'group', color: 'text-blue-400' },
                            { label: 'Total Reviews', value: stats.totalReviews || 0, icon: 'reviews', color: 'text-green-400' },
                            { label: 'Total Movies', value: stats.totalMovies || 0, icon: 'movie', color: 'text-purple-400' },
                            { label: 'Avg Rating', value: stats.avgRating?.toFixed(1) || '0.0', icon: 'star', color: 'text-primary' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-surface-card border border-outline-variant/60 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`material-symbols-outlined text-[28px] ${stat.color}`}>{stat.icon}</span>
                                    <span className="text-text-muted text-sm uppercase tracking-wider font-medium">{stat.label}</span>
                                </div>
                                <div className="text-3xl font-heading font-bold text-text-primary">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-surface-card border border-outline-variant/60 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-outline-variant/40 text-text-muted text-xs uppercase tracking-wider">
                                        <th className="text-left p-4">User</th>
                                        <th className="text-left p-4">Email</th>
                                        <th className="text-left p-4">Role</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id} className="border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                                            <td className="p-4 text-text-primary font-semibold">{u.displayName || u.username || 'N/A'}</td>
                                            <td className="p-4 text-text-secondary">{u.email}</td>
                                            <td className="p-4">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    className="bg-surface border border-outline-variant/60 rounded px-2 py-1 text-text-primary text-xs focus:outline-none focus:border-primary"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-300 text-xs font-semibold uppercase tracking-wider">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="bg-surface-card border border-outline-variant/60 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-outline-variant/40 text-text-muted text-xs uppercase tracking-wider">
                                        <th className="text-left p-4">User</th>
                                        <th className="text-left p-4">Movie ID</th>
                                        <th className="text-left p-4">Rating</th>
                                        <th className="text-left p-4">Comment</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((r) => (
                                        <tr key={r._id} className="border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                                            <td className="p-4 text-text-primary font-semibold">{r.user?.displayName || r.user?.username || 'N/A'}</td>
                                            <td className="p-4 text-text-secondary font-mono text-xs">{r.tmdbMovieId}</td>
                                            <td className="p-4 text-primary font-bold">{r.rating}/5</td>
                                            <td className="p-4 text-text-secondary max-w-xs truncate">{r.comment}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDeleteReview(r._id)} className="text-red-400 hover:text-red-300 text-xs font-semibold uppercase tracking-wider">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
