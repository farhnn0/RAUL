import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.raul_token || req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.AUTH_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // Menyimpan role dan id
        next();
    });
};
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next({ status: 403, message: 'Forbidden: ANDA BUKAN ADMIN' });
    }
    next();
};

// SECURITY HEADERS (HELMET)
// Mengamankan HTTP headers (XSS filter, no-sniff, dll)
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // Izinkan gambar dari TMDB
            imgSrc: ["'self'", "data:", "https://image.tmdb.org"], 
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" } 
});

// --- RATE LIMITING (PEMBATAS REQUEST) ---

// Limiter Global: Mencegah DoS (Denial of Service) sederhana
// Berlaku untuk semua request ke API
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 1002, // Maksimal 100 request per IP dalam 15 menit
    message: { 
        message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.' 
    },
    standardHeaders: true, // Info rate limit di header `RateLimit-*`
    legacyHeaders: false, // Nonaktifkan header `X-RateLimit-*` yang lama
});

// Limiter Khusus Auth: Mencegah Brute Force Password
// Berlaku khusus untuk rute login/signup/verify
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 jam
    max: 10, // Maksimal 10 request gagal/sukses per jam per IP
    message: { 
        message: 'Terlalu banyak percobaan login/daftar. Silakan coba lagi setelah 1 jam.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const errorHandler = (err, req, res, next) => {
    const defaultMessage = "We're having technical issues. Please try again later";
    const { status, message, error } = err;
    if (error) {
        console.log(error);
    }
    res.status(status).json({ message: message || defaultMessage });
};
