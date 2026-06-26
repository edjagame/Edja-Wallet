const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');
const { sendPasswordResetEmail } = require('../utils/mailer');
const {
    EMAIL_MESSAGE,
    PASSWORD_MESSAGE,
    normalizeName,
    normalizeEmail,
    isValidEmail,
    isStrongPassword
} = require('../utils/authValidation');

const hashResetToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const buildPasswordResetUrl = (token) => {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    return `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
};

// Register
router.post('/register', async (req, res) => {
  try {

    const { name, email, password } = req.body;
    const normalizedName = normalizeName(name);
    const normalizedEmail = normalizeEmail(email);

    // Basic validation
    if (!normalizedName || !normalizedEmail || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ message: EMAIL_MESSAGE });
    }
    if (!isStrongPassword(password)) {
        return res.status(400).json({ message: PASSWORD_MESSAGE });
    }

    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
        [normalizedName, normalizedEmail, bcryptPassword]
    );

    const userId = newUser.rows[0].id;

    // Create default categories for the new user
    const defaultCategories = [
        ['Food & Drinks', 'expense', '🍔'],
        ['Transportation', 'expense', '🚗'],
        ['Rent/Housing', 'expense', '🏠'],
        ['Entertainment', 'expense', '🎬'],
        ['Salary', 'income', '💰'],
        ['Gifts', 'income', '🎁'],
        ['Other', 'expense', '📦'],
        ['Other', 'income', '📦']
    ];

    for (const [catName, type, icon] of defaultCategories) {
        await pool.query(
            "INSERT INTO categories (user_id, name, type, icon) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
            [userId, catName, type, icon]
        );
    }

    const token = jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ 
        token, 
        user: { 
            id: newUser.rows[0].id, 
            name: newUser.rows[0].name, 
            email: newUser.rows[0].email 
        } 
    });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
  
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password) {
        return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
        if (user.rows.length === 0) {
        return res.status(401).json({ message: "Password or email is incorrect" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
        return res.status(401).json({ message: "Password or email is incorrect" });
        }

        const token = jwt.sign({ user: { id: user.rows[0].id } }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ 
            token, 
            user: { 
                id: user.rows[0].id, 
                name: user.rows[0].name, 
                email: user.rows[0].email 
            } 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
        
        // Return generic success message immediately to prevent timing attacks / email enumeration
        res.json({ message: "If an account with that email exists, a password reset link has been sent." });

        if (user.rows.length > 0) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenHash = hashResetToken(resetToken);
            // 1 hour expiry
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
            
            await pool.query(
                "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3",
                [resetTokenHash, resetTokenExpiry, user.rows[0].id]
            );

            await sendPasswordResetEmail({
                to: user.rows[0].email,
                resetUrl: buildPasswordResetUrl(resetToken)
            });
        }
    } catch (err) {
        console.error(err.message);
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ message: PASSWORD_MESSAGE });
        }

        const resetTokenHash = hashResetToken(token);

        const user = await pool.query(
            "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
            [resetTokenHash]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(newPassword, salt);

        await pool.query(
            "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2",
            [bcryptPassword, user.rows[0].id]
        );

        res.json({ message: "Password reset successfully. You can now login with your new password." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Change Password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new passwords are required" });
        }
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ message: PASSWORD_MESSAGE });
        }

        const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect old password" });
        }

        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(newPassword, salt);

        await pool.query(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            [bcryptPassword, req.user.id]
        );

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
