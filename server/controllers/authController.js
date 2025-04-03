import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc Register new admin
// @route POST /api/auth/register
export const registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new admin
        const newAdmin = await pool.query(
            "INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING *",
            [username, hashedPassword]
        );

        // Send response with JWT Token
        res.status(201).json({
            id: newAdmin.rows[0].id,
            username: newAdmin.rows[0].username,
            token: generateToken(newAdmin.rows[0].id),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Authenticate admin & get token
// @route POST /api/auth/login
export const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        
        // Find user by username
        const admin = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);

        if (admin.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Send response with JWT Token
        res.json({
            id: admin.rows[0].id,
            username: admin.rows[0].username,
            token: generateToken(admin.rows[0].id),
        });
        
          

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
