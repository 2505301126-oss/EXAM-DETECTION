const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet()); // Secure headers
app.use(morgan('dev')); // Request logging

const otpStore = {};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your AI Exam Portal OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #1e293b; background-color: #0f172a; color: #f1f5f9; border-radius: 8px;">
                <h2 style="color: #06b6d4;">AI Assessment Portal</h2>
                <p>Authentication requested for: <strong>${email}</strong></p>
                <div style="font-size: 24px; font-weight: bold; background: #1e293b; padding: 15px; text-align: center; border-radius: 4px; border: 1px solid #06b6d4; color: #06b6d4; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="font-size: 12px; color: #94a3b8;">This code will expire in 5 minutes.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send email" });
    }
});

app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!otpStore[email]) return res.status(400).json({ success: false, message: "OTP not found or expired" });
    const { otp: storedOtp, expires } = otpStore[email];
    if (Date.now() > expires) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: "OTP has expired" });
    }
    if (storedOtp === otp) {
        delete otpStore[email];
        res.json({ success: true, message: "OTP verified" });
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
