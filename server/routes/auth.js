const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Register
router.post('/register', async (req, res) => {
  try {

    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
        [name, email, bcryptPassword]
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
        if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
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

module.exports = router;