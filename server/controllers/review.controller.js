import { db } from '../configs/db.js';
import { ObjectId } from 'mongodb';

const reviewsCollection = db.collection('reviews');
const usersCollection = db.collection('users');

// Membuat review baru
export const createReview = async (req, res, next) => {
        try {
                const { tmdbMovieId, rating, comment } = req.body;
                const userId = req.user.id;

                // Validasi input
                if (!tmdbMovieId || !rating || !comment) {
                        return res.status(400).json({ message: 'Semua field harus diisi' });
                }

                // Validasi rating
                if (rating < 1 || rating > 5) {
                        return res.status(400).json({ message: 'Rating harus antara 1-5' });
                }

                // Cek apakah user sudah review film ini
                const existingReview = await reviewsCollection.findOne({
                        userId: new ObjectId(userId),
                        tmdbMovieId: Number(tmdbMovieId)
                });

                if (existingReview) {
                        return res.status(400).json({
                                message: 'Anda sudah memberi review untuk film ini'
                        });
                }

                const newReview = {
                        userId: new ObjectId(userId),
                        tmdbMovieId: Number(tmdbMovieId),
                        rating: Number(rating),
                        comment,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                };

                // 1. Simpan ke koleksi 'reviews'
                const result = await reviewsCollection.insertOne(newReview);

                // 2. ✅ UPDATE: Tambahkan reviewId ke array 'reviews' di collection 'users'
                await usersCollection.updateOne(
                        { _id: new ObjectId(userId) },
                        {
                                $push: { reviews: result.insertedId },
                                $set: { updatedAt: new Date() }
                        }
                );

                // 3. Ambil data user untuk response
                const user = await usersCollection.findOne(
                        { _id: new ObjectId(userId) },
                        { projection: { username: 1 } }
                );

                // Return review dengan data user
                res.status(201).json({
                        ...newReview,
                        _id: result.insertedId,
                        user: {
                                _id: user._id,
                                username: user.username,
                                displayName: user.displayName
                        }
                });

        } catch (error) {
                console.error('Error creating review:', error);
                next({ status: 500, message: error.message });
        }
};

// Mendapatkan semua review untuk 1 film (DENGAN DATA USER)
export const getReviewsForMovie = async (req, res, next) => {
        try {
                const tmdbMovieId = Number(req.params.movieId);

                // GUNAKAN AGGREGATE dengan LOOKUP untuk JOIN data user
                const reviews = await reviewsCollection.aggregate([
                        { $match: { tmdbMovieId } },
                        {
                                $lookup: {
                                        from: 'users',
                                        localField: 'userId',
                                        foreignField: '_id',
                                        as: 'user'
                                }
                        },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                                $project: {
                                        _id: 1,
                                        tmdbMovieId: 1,
                                        rating: 1,
                                        comment: 1,
                                        createdAt: 1,
                                        updatedAt: 1,
                                        'user._id': 1,
                                        'user.username': 1,
                                        'user.displayName': 1
                                }
                        },
                        { $sort: { createdAt: -1 } }
                ]).toArray();

                res.status(200).json(reviews);

        } catch (error) {
                console.error('Error getting reviews:', error);
                next({ status: 500, message: error.message });
        }
};

// Mendapatkan review milik user yang login
export const getMyReviews = async (req, res, next) => {
        try {
                const userId = req.user.id;

                const reviews = await reviewsCollection.aggregate([
                        { $match: { userId: new ObjectId(userId) } },
                        {
                                $lookup: {
                                        from: 'users',
                                        localField: 'userId',
                                        foreignField: '_id',
                                        as: 'user'
                                }
                        },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                                $project: {
                                        _id: 1,
                                        tmdbMovieId: 1,
                                        rating: 1,
                                        comment: 1,
                                        createdAt: 1,
                                        updatedAt: 1,
                                        'user._id': 1,
                                        'user.username': 1
                                }
                        },
                        { $sort: { createdAt: -1 } }
                ]).toArray();

                res.status(200).json(reviews);
        } catch (error) {
                console.error('Error getting my reviews:', error);
                next({ status: 500, message: error.message });
        }
};

export const updateReview = async (req, res, next) => {
        try {
                const reviewId = req.params.id;
                const { rating, comment } = req.body;
                const user = req.user;

                if (!rating && !comment) {
                        return next({ status: 400, message: 'Rating atau comment diperlukan untuk update' });
                }

                // cari reviewnya
                const review = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });
                if (!review) {
                        return next({ status: 404, message: 'Review tidak ditemukan' });
                }

                // Cek apakah user adalah Admin ATAU pemilik review
                if (user.role !== 'admin' && review.userId.toString() !== user.id) {
                        return next({ status: 403, message: 'Forbidden: Anda tidak punya izin mengedit review ini' });
                }

                // data update
                const updateData = {
                        updatedAt: new Date(),
                };
                if (rating) updateData.rating = Number(rating);
                if (comment) updateData.comment = comment;

                // Lakukan update
                const result = await reviewsCollection.findOneAndUpdate(
                        { _id: new ObjectId(reviewId) },
                        { $set: updateData },
                        { returnDocument: 'after' }
                );

                res.status(200).json(result);

        } catch (error) {
                next({ status: 500, error });
        }
};

export const getMovieRatingStats = async (req, res, next) => {
        try {
                const tmdbMovieId = Number(req.params.movieId);

                const stats = await reviewsCollection.aggregate([
                        { $match: { tmdbMovieId } },
                        {
                                $group: {
                                        _id: "$tmdbMovieId",
                                        averageRating: { $avg: "$rating" },
                                        totalVotes: { $sum: 1 }
                                }
                        }
                ]).toArray();

                if (stats.length > 0) {
                        res.status(200).json({
                                average: stats[0].averageRating,
                                count: stats[0].totalVotes
                        });
                } else {
                        res.status(200).json({ average: 0, count: 0 });
                }
        } catch (error) {
                // Jika error, kembalikan 0 agar frontend tidak rusak
                res.status(200).json({ average: 0, count: 0 });
        }
};

//khusus admin
export const getAllReviews = async (req, res, next) => {
        try {
                const reviews = await reviewsCollection.aggregate([
                {
                        $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                        }
                },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                {
                        $project: {
                        _id: 1,
                        tmdbMovieId: 1,
                        rating: 1,
                        comment: 1,
                        createdAt: 1,
                        'user.username': 1,
                        'user.email': 1 
                        }
                },
                { $sort: { createdAt: -1 } } // Urutkan dari yang terbaru
                ]).toArray();

                res.status(200).json(reviews);
        } catch (error) {
                console.error('Error getting all reviews:', error);
                next({ status: 500, message: error.message });
        }
};

export const deleteReview = async (req, res, next) => {
        try {
                const reviewId = req.params.id;
                const user = req.user;

                // Cari review-nya dulu
                const review = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });
                if (!review) {
                        return next({ status: 404, message: 'Review tidak ditemukan' });
                }

                // Otorisasi: Cek apakah user adalah Admin ATAU pemilik review
                if (user.role !== 'admin' && review.userId.toString() !== user.id) {
                        return next({ status: 403, message: 'Forbidden: Anda tidak punya izin menghapus review ini' });
                }

                // 1. Lakukan penghapusan dari collection reviews
                await reviewsCollection.deleteOne({ _id: new ObjectId(reviewId) });

                // 2. ✅ UPDATE: Hapus reviewId dari array 'reviews' di collection 'users'
                await usersCollection.updateOne(
                        { _id: review.userId },
                        {
                                $pull: { reviews: new ObjectId(reviewId) },
                                $set: { updatedAt: new Date() }
                        }
                );

                res.status(200).json({ message: 'Review berhasil dihapus' });

        } catch (error) {
                next({ status: 500, error });
        }
};