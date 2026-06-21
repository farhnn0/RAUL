import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../configs/db.js';
import { sendEmail } from '../utils/sendEmail.js';
import { ObjectId } from 'mongodb';

const collection = db.collection('users');

export const signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const query = {
            $or: [{ email }, { username }],
        };
        const existingUser = await collection.findOne(query);
        if (existingUser) {
            if (!existingUser.isVerified) {
                return next({
                    status: 400,
                    message: 'Email ini sudah terdaftar tapi belum diverifikasi. Cek email Anda.',
                });
            }
            return next({
                status: 422,
                message: 'Email or Username is already registered.',
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            username,
            email,
            password: hashedPassword,
            role: 'customer',
            watchlist: [],
            isVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        const { insertedId } = await collection.insertOne(user);
        // --- KIRIM EMAIL VERIFIKASI ---
        // 1. Buat token verifikasi
        const verificationToken = jwt.sign(
            { id: insertedId, purpose: 'verify-email' },
            process.env.AUTH_SECRET,
            { expiresIn: '1h' }
        );

        // 2. Buat Link Verifikasi
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

        // 3. Konten Email (HTML)
        const emailHtml = `
            <h1>Selamat Datang di Raul Film!</h1>
            <p>Satu langkah lagi untuk mengaktifkan akun Anda. Silakan klik link di bawah ini:</p>
            <a href="${verificationLink}" style="padding: 10px 15px; background-color: #ffc107; color: #000; text-decoration: none; border-radius: 5px;">
                Verifikasi Email Saya
            </a>
            <p>Link ini hanya berlaku selama 1 jam.</p>
        `;

        // 4. Kirim Email
        await sendEmail(email, "Verifikasi Akun Raul Film Anda", emailHtml);
        
        // --- SELESAI KIRIM EMAIL ---

        // const token = jwt.sign({ id: insertedId, role: user.role }, process.env.AUTH_SECRET);
        // user._id = insertedId;
        // const { password: pass, updatedAt, createdAt, ...rest } = user;
        // res
        //     .cookie('raul_token', token, { httpOnly: true })
        //     .status(200)
        //     .json(rest);

        res.status(201).json({ 
            message: 'Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.' 
        });
    } catch (error) {
        // Log error asli dari sendEmail
        console.error("Error di dalam signup catch:", error); 
        // Kirim pesan error ke frontend
        next({ 
            status: 500, 
            message: "Gagal mengirim email verifikasi.",
            error: error // Teruskan error asli ke errorHandler
        });
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            return next({ status: 400, message: 'Token tidak ditemukan' });
        }

        let payload;
        try {
            // Verifikasi token
            payload = jwt.verify(token, process.env.AUTH_SECRET);
        } catch (err) {
            return next({ status: 401, message: 'Token tidak valid atau kedaluwarsa' });
        }

        // Pastikan token ini untuk verifikasi email
        if (payload.purpose !== 'verify-email') {
            return next({ status: 401, message: 'Token tidak valid' });
        }

        // Cari user
        const user = await collection.findOne({ _id: new ObjectId(payload.id) });
        if (!user) {
            return next({ status: 404, message: 'User tidak ditemukan' });
        }
        if (user.isVerified) {
            return res.status(200).json({ message: 'Email sudah diverifikasi. Silakan login.' });
        }

        // Update user menjadi terverifikasi
        await collection.updateOne(
            { _id: new ObjectId(payload.id) },
            { $set: { isVerified: true, updatedAt: new Date().toISOString() } }
        );

        res.status(200).json({ message: 'Email berhasil diverifikasi! Silakan login.' });

    } catch (error) {
        next({ status: 500, error });
    }
};

export const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next({ status: 400, message: 'Email diperlukan' });
        }

        const user = await collection.findOne({ email });

        // --- PERBAIKAN LOGIKA KEAMANAN ---
        // hanya kirim email jika user-nya ada dan user-nya BELUM diverifikasi.
        if (user && !user.isVerified) {
            
            // 1. Buat token verifikasi baru (berlaku 1 jam)
            const verificationToken = jwt.sign(
                { id: user._id, purpose: 'verify-email' },
                process.env.AUTH_SECRET,
                { expiresIn: '1h' }
            );

            // 2. Buat Link Verifikasi
            const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

            // 3. Konten Email (HTML)
            const emailHtml = `
                <h1>Verifikasi Ulang Akun Raul Film</h1>
                <p>Anda meminta untuk mengirim ulang email verifikasi. Silakan klik link di bawah ini:</p>
                <a href="${verificationLink}" style="padding: 10px 15px; background-color: #ffc107; color: #000; text-decoration: none; border-radius: 5px;">
                    Verifikasi Email Saya
                </a>
                <p>Link ini hanya berlaku selama 1 jam.</p>
            `;

            // 4. Kirim Email
            await sendEmail(email, "Verifikasi Ulang Akun Raul Film Anda", emailHtml);
        }

        // --- RESPON GENERIK (ANTI-ENUMERATION) ---
        // SELALU kirim respons ini, apapun status user-nya guna mencegah enumeration attack
        res.status(200).json({ 
            message: 'Periksa Email Anda.' 
        });
        // --- AKHIR PERBAIKAN ---

    } catch (error) {
        // Ini hanya akan error jika database/Nodemailer benar-benar crash
        console.error("Error di resendVerification:", error);
        next({ status: 500, error });
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await collection.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next({ status: 401, message: 'Email atau password salah' });
        }
        // --- TAMBAHAN VALIDASI ---
        if (!user.isVerified) {
            return next({ 
                status: 403, 
                message: 'Akun Anda belum diverifikasi. Silakan cek email Anda.' 
            });
        }
        // --- SELESAI VALIDASI ---

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.AUTH_SECRET);
        const { username } = user;
        res
            .cookie('raul_token', token, { httpOnly: true, path: '/' })
            .status(200)
            .json({ username });
    } catch (error) {
        next({ status: 500, error });
    }
};

export const logout = async (req, res, next) => {
    try {
        res
        .clearCookie('raul_token', {
            path: '/',
        })
        .status(200)
        .json({ message: 'Logout berhasil' });
    } catch (error) {
        next({ status: 500, error });
    }
};

// Request Link Reset
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await collection.findOne({ email });

        // Keamanan: Jika user ada dan sudah verifikasi, baru proses
        if (user && user.isVerified) {
            
            // 1. Buat token reset
            const resetToken = jwt.sign(
                { id: user._id, purpose: 'reset-password' }, // purpose berbeda dari verify-email
                process.env.AUTH_SECRET,
                { expiresIn: '5m' } // Waktu singkat untuk keamanan
            );

            // 2. Link Frontend
            const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

            // 3. Konten Email
            const emailHtml = `
                <h1>Reset Password</h1>
                <p>Seseorang meminta untuk mengatur ulang kata sandi akun Raul Film Anda.</p>
                <p>Jika ini bukan Anda, abaikan email ini.</p>
                <br/>
                <a href="${resetLink}" style="padding: 10px 15px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px;">
                    Atur Ulang Kata Sandi
                </a>
                <p>Link ini berlaku selama 5 menit.</p>
            `;

            // 4. Kirim Email
            await sendEmail(email, "Reset Password - Raul Film", emailHtml);
        }

        // Keamanan: Selalu kirim respons SUKSES GENERIK
        res.status(200).json({
            message: 'Jika email terdaftar dan terverifikasi, kami telah mengirimkan link reset password.'
        });

    } catch (error) {
        console.error("Error forgotPassword:", error);
        next({ status: 500, error });
    }
};

// Set Password Baru
export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return next({ status: 400, message: 'Token dan password baru diperlukan.' });
        }

        // 1. Verifikasi Token
        let payload;
        try {
            payload = jwt.verify(token, process.env.AUTH_SECRET);
        } catch (err) {
            return next({ status: 401, message: 'Link reset tidak valid atau sudah kedaluwarsa.' });
        }

        if (payload.purpose !== 'reset-password') {
            return next({ status: 401, message: 'Token tidak valid.' });
        }

        // 2. Hash Password Baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update Password di Database
        await collection.updateOne(
            { _id: new ObjectId(payload.id) },
            { 
                $set: { 
                    password: hashedPassword,
                    updatedAt: new Date().toISOString() 
                } 
            }
        );

        res.status(200).json({ message: 'Kata sandi berhasil diubah. Silakan login dengan kata sandi baru.' });

    } catch (error) {
        console.error("Error resetPassword:", error);
        next({ status: 500, error });
    }
};