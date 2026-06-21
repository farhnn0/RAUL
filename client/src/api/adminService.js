import api from './api';

// Ambil Statistik
export const fetchDashboardStats = async () => {
    const res = await api.get('/admin/stats');
    return res.data;
};

// Ambil Semua User
export const fetchAllUsers = async () => {
    const res = await api.get('/users');
    return res.data;
};

// Hapus User
export const deleteUser = async (id) => {
    const res = await api.delete(`/users/delete/${id}`);
    return res.data;
};

// Ambil Semua Review
export const fetchAllReviews = async () => {
    const res = await api.get('/reviews/all');
    return res.data;
};

// Hapus Review
export const deleteReview = async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
};

// Update Role User
export const updateUserRole = async (userId, newRole) => {
    const res = await api.patch(`/users/update/${userId}`, { role: newRole });
    return res.data;
};