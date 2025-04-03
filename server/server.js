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
  origin: "https://later-comer-monitoring-system.vercel.app", // Allow frontend origin
  methods: "GET,POST,PUT,DELETE", // Allowed methods
  credentials: true // Allow cookies/auth headers
}));

  
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
