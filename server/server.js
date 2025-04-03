import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from "./routes/attendanceRoutes.js";
import studentRoutes from './routes/studentRoutes.js';

dotenv.config();
const app = express();

// ✅ Set CORS for a Specific Frontend URL
app.use(cors({
    origin: "https://later-comer-monitoring-system.vercel.app", // Allow only your frontend
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
}));

// ✅ Handle Preflight Requests Manually
app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://later-comer-monitoring-system.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(200);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
    res.send("Backend is working!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
