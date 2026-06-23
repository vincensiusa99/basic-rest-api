// File: src/config/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Limiter umum: semua endpoint API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // 100 request per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Terlalu banyak request dari IP ini. Coba lagi dalam 15 menit.',
        },
    },
});

// Limiter ketat: endpoint autentikasi (anti brute-force)
// CATATAN: skipSuccessfulRequests SENGAJA tidak dipakai.
// Jika diaktifkan, login berhasil (200) tidak dihitung ke counter
// sehingga brute-force dengan kredensial valid tidak pernah kena 429.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 6,                   // Maksimal 6 percobaan login per 15 menit
    standardHeaders: true,    // Kirim header RateLimit-* ke client
    legacyHeaders: false,
    message: {
        error: {
            code: 'TOO_MANY_ATTEMPTS',
            message: 'Terlalu banyak percobaan login. Tunggu 15 menit.',
        },
    },
});

// Limiter untuk endpoint sensitif lainnya (refresh token, register)
const sensitiveLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 jam
    max: 20,
    message: {
        error: {
            code: 'TOO_MANY_REQUESTS', message: 'Batas request tercapai.'
        }
    },
});

module.exports = { apiLimiter, authLimiter, sensitiveLimiter };