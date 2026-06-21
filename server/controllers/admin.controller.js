import { db } from '../configs/db.js';

// Mengambil statistik ringkas untuk Dashboard
export const getDashboardStats = async (req, res, next) => {
    try {
        const usersCollection = db.collection('users');
        const reviewsCollection = db.collection('reviews');

        // Hitung total data secara parallel
        const [totalUsers, totalReviews] = await Promise.all([
            usersCollection.countDocuments(),
            reviewsCollection.countDocuments()
        ]);

        res.status(200).json({
            totalUsers,
            totalReviews
        });

    } catch (error) {
        next({ status: 500, message: error.message });
    }
};