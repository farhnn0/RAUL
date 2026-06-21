import { db } from '../configs/db.js';
import { ObjectId } from 'mongodb';
import bcrypt from "bcrypt";

const collection = db.collection('users');

export const getUserProfile = async (req, res, next) => {
    try {
        const user = await collection.findOne({ _id: new ObjectId(req.user.id) });
        if (!user) return next({ status: 404, message: 'User not found' });

        const { password, ...userData } = user;
        res.status(200).json(userData);
    } catch (error) {
        next({ status: 500, error });
    }
};


export const getUsers = async (req, res) => {
    let result = await collection.find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json(result);
};

export const getUser = async (req, res, next) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const user = await collection.findOne(query, { projection: { password: 0 } });
        if (!user) {
            return next({ status: 404, message: 'User not found!' });
        }
        res.status(200).json(user);
    } catch (error) {
        next({ status: 500, error });
    }
};

// --- UPDATE USER (Profile & Password) ---
export const updateUser = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const currentUser = req.user; // { id, role } dari token

        // 1. OTORISASI: Cek apakah user mengedit diri sendiri atau dia adalah Admin
        if (currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
            return next({ status: 403, message: 'Forbidden: Anda tidak punya izin mengubah data user ini' });
        }

        // Ambil data user dari database
        const userInDb = await collection.findOne({ _id: new ObjectId(targetUserId) });
        if (!userInDb) return next({ status: 404, message: 'User tidak ditemukan' });

        // Pisahkan data password dari data lain
        const { currentPassword, newPassword, role, ...otherData } = req.body;
        
        // --- VALIDASI DUPLIKAT USERNAME & EMAIL ---
        // Cek jika user mencoba mengganti username
        if (otherData.username && otherData.username !== userInDb.username) {
            const usernameExists = await collection.findOne({ username: otherData.username });
            if (usernameExists) {
                return next({ status: 400, message: 'Username sudah digunakan oleh pengguna lain.' });
            }
        }

        // Cek jika user mencoba mengganti email
        if (otherData.email && otherData.email !== userInDb.email) {
            const emailExists = await collection.findOne({ email: otherData.email });
            if (emailExists) {
                return next({ status: 400, message: 'Email sudah digunakan oleh pengguna lain.' });
            }
        }
        // -----------------------------------------

        const updateData = {
            $set: {
                ...otherData, // Update username, email, dll
                updatedAt: new Date().toISOString(),
            }
        };

        // Logika khusus ganti role
        if (role) {
            if (currentUser.role === 'admin') {
                updateData.$set.role = role; // Izinkan update role
            } else {
                return next({ status: 403, message: "Hanya admin bisa ganti role" });
            }
        }

        // 2. LOGIKA GANTI PASSWORD
        if (newPassword) {
            // Admin tidak boleh ganti password user lain langsung di sini
            if (currentUser.role === 'admin' && currentUser.id !== targetUserId) {
                return next({ status: 403, message: 'Admin tidak diizinkan mengganti password user lain secara langsung.' });
            }

            // User biasa WAJIB kirim password lama
            if (!currentPassword) {
                return next({ status: 400, message: 'Harap masukkan password lama untuk mengganti password.' });
            }

            // Cek password lama
            const isMatch = await bcrypt.compare(currentPassword, userInDb.password);
            if (!isMatch) {
                return next({ status: 400, message: 'Password lama tidak sesuai.' });
            }

            // Hash password baru
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.$set.password = hashedPassword;
        }

        // 3. EKSEKUSI UPDATE
        const updatedUser = await collection.findOneAndUpdate(
            { _id: new ObjectId(targetUserId) }, 
            updateData, 
            { returnDocument: 'after' }
        );

        // Buang password dari respons
        const { password: p, ...rest } = updatedUser || {};
        
        res.status(200).json({
            message: 'Data berhasil diperbarui',
            user: rest
        });

    } catch (error) {
        console.error(error);
        next({ status: 500, error });
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return next({ status: 403, message: 'Forbidden: Anda tidak punya izin menghapus user ini' });
        }

        const query = { _id: new ObjectId(req.params.id) };
        await collection.deleteOne(query);
        res.status(200).json({ message: "User has been deleted!" });
    } catch (error) {
        next({ status: 500, error });
    }
}

export const toggleWatchlist = async (req, res, next) => {
    try {
        const { tmdbMovieId } = req.body;
        const userId = req.user.id;

        if (!tmdbMovieId) {
            return next({ status: 400, message: 'tmdbMovieId diperlukan' });
        }

        const numericMovieId = Number(tmdbMovieId);
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return next({ status: 404, message: 'User not found' });
        }

        let updateOperation;
        let message;

        // Cek apakah film sudah ada di watchlist
        if (user.watchlist && user.watchlist.includes(numericMovieId)) {
            // Jika ada, hapus ($pull)
            updateOperation = { $pull: { watchlist: numericMovieId } };
            message = 'Dihapus dari watchlist';
        } else {
            // Jika tidak ada, tambahkan ($addToSet agar tidak duplikat)
            updateOperation = { $addToSet: { watchlist: numericMovieId } };
            message = 'Ditambahkan ke watchlist';
        }

        // Update dokumen user di database
        await collection.updateOne({ _id: new ObjectId(userId) }, updateOperation);
        
        res.status(200).json({ message });

    } catch (error) {
        next({ status: 500, error });
    }
};

export const getWatchlist = async (req, res, next) => {
    try {
        const userId = req.user.id; 

        const user = await collection.findOne(
            { _id: new ObjectId(userId) },
            { projection: { watchlist: 1 } } // ambil field watchlist
        );

        if (!user) {
            return next({ status: 404, message: 'User tidak ditemukan' });
        }
        
        res.status(200).json(user.watchlist || []); // Kirim array watchlist
    
    } catch (error) {
        next({ status: 500, error });
    }
};