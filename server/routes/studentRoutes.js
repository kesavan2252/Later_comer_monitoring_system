import express from 'express';
import pool from '../config/db.js';
import { 
    getAllStudents, 
    addStudent, 
    importStudents, 
    getStudentByRollNo, 
    updateStudent,
    getStudentByRollNoAndBatch} 
    from '../controllers/studentController.js'; // Import functions

import multer from 'multer';  

import protect from '../middleware/authMiddleware.js';
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = express.Router();

// ✅ Fetch all students
router.get('/', protect, getAllStudents);

// ✅ Add a new student
router.post('/',authenticateToken ,addStudent);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/"); // Ensure this folder exists in your project
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
// ✅ Import students from CSV
router.post('/import', upload.single('file'), importStudents);


// ✅ Fetch student by Roll Number
router.get('/:rollNo', protect, getStudentByRollNo);
router.get('/:rollNo', protect, (req, res, next) => {
    console.log("Received request for Roll No:", req.params.rollNo);
    next();
}, getStudentByRollNo);


// ✅ Update student details
router.put("/:roll_no", updateStudent);


// ✅ Delete Student by Roll Number
// Delete a student by roll number
router.get('/:rollNo/:batch',authenticateToken, getStudentByRollNoAndBatch);


  router.delete('/:department/:batch', async (req, res) => {
    const { department, batch } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM students WHERE department = $1 AND batch = $2 RETURNING *",
            [department.trim(), batch.trim()]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Students Data not found." });
        }

        res.json({ message: `${result.rowCount} students deleted successfully.` });
    } catch (error) {
        console.error("Error deleting batch:", error);
        res.status(500).json({ message: "Server error." });
    }
});




export default router;
