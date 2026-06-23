// Buat file sementara: test-injection.js
const prisma = require('./src/config/prisma');

async function demo() {
    // Input berbahaya dari penyerang
    const maliciousEmail = "' OR '1'='1";

    // ✗ Cara RENTAN (jika pakai raw query):
    // prisma.$queryRawUnsafe(
    // `SELECT * FROM users WHERE email = '${maliciousEmail}'`
    // );
    // Query: WHERE email = '' OR '1'='1' → SEMUA user!

    // ✓ Cara AMAN — Prisma parameterized query:
    const user = await prisma.user.findUnique({
        where: { email: maliciousEmail }
    });
    // Query: WHERE email = \"' OR '1'='1\" (sebagai literal string)
    // Hasilnya: null — tidak ada user dengan email seperti itu
    console.log('Result:', user); // null — injection GAGAL
}
demo();

// Jalankan: node test-injection.js
// Hasilnya: null — Prisma melindungi dari SQL injection secara otomatis!