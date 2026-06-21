import nodemailer from 'nodemailer';
import 'dotenv/config';

// 1. Konfigurasi "Transporter" untuk mengirim email
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Fungsi untuk mengirim email.
 * @param {string} to - Email penerima
 * @param {string} subject - Subjek email
 * @param {string} html - Konten email dalam bentuk HTML
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"Raul Film" <${process.env.SMTP_FROM_EMAIL}>`,
            to: to,
            subject: subject,
            html: html,
        };

        // Kirim email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email terkirim ke ${to}: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error("Gagal mengirim email:", error);
        throw error;
    }
};