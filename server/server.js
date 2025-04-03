import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from "./routes/attendanceRoutes.js";
import studentRoutes from './routes/studentRoutes.js'; // ✅ Import student routes
dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use(cors({
    origin: "*", // Allow requests from any origin (Only for testing)
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});



app.use(express.json());

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
