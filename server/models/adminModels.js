import pool from '../config/db.js';

// Find Admin by Username
export const findAdminByUsername = async (username) => {
    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    return result.rows[0];
};

// Create New Admin
export const createAdmin = async (username, hashedPassword) => {
    const result = await pool.query(
        "INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING *",
        [username, hashedPassword]
    );
    return result.rows[0];
};
