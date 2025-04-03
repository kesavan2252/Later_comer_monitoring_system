import pool from '../config/db.js';
import asyncHandler from 'express-async-handler';
import fs from "fs";
import csv from "csv-parser";


// ✅ Fetch All Students (Already Exists)
export const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students");
    res.json(result.rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// ✅ Add New Student (New Function)
export const addStudent = async (req, res) => {
    const { rollNo, name, department, batch } = req.body;
  
    if (!rollNo || !name || !department || !batch) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const query = "INSERT INTO students (roll_no, name, department, batch) VALUES ($1, $2, $3, $4) RETURNING *";
      const values = [rollNo, name, department, batch];
  
      const result = await pool.query(query, values);
      res.status(201).json({ message: "Student added successfully", student: result.rows[0] });
    } catch (error) {
        if (error.code === "23505") { // Unique constraint violation
          return res.status(400).json({ message: "Roll No already exists" });
        }
        console.error("Database Error:", error);
        res.status(500).json({ message: "Database error", error: error.message });
      }
      
  };
  



  export const importStudents = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!" });
    }

    const batch = req.body.batch;
    if (!batch) {
        return res.status(400).json({ message: "Batch is required!" });
    }

    const results = [];
    const skippedRollNos = []; // Store duplicate roll numbers
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
            try {
                for (const student of results) {
                    const { roll_no, name, department } = student;

                    // Check if student already exists
                    const checkQuery = "SELECT * FROM students WHERE roll_no = $1";
                    const checkResult = await pool.query(checkQuery, [roll_no]);

                    if (checkResult.rows.length > 0) {
                        skippedRollNos.push(roll_no); // Store duplicate roll number
                        continue; // Skip duplicate students
                    }

                    const insertQuery =
                        "INSERT INTO students (roll_no, name, department, batch) VALUES ($1, $2, $3, $4) ON CONFLICT (roll_no) DO NOTHING;";
                    await pool.query(insertQuery, [roll_no, name, department, batch]);
                }

                // Send skipped roll numbers in response
                res.status(200).json({ 
                    message: "Students imported successfully!", 
                    skipped: skippedRollNos 
                });

            } catch (error) {
                console.error("Error importing students:", error);
                res.status(500).json({ message: "Server error while importing students!" });
            }
        });
});


  

// ✅ Get Student by Roll Number
export const getStudentByRollNo = async (req, res) => {
    const { rollNo } = req.params;
    console.log("🔍 Searching for Roll No:", rollNo); // Debugging
  
    try {
        const result = await pool.query("SELECT * FROM students WHERE roll_no ILIKE $1", [rollNo]); // Ensure column name is correct
  
      console.log("📝 Query Result:", result.rows); // Debugging
      if (result.rows.length === 0) {
        console.log("❌ Student not found in DB.");
        return res.status(404).json({ message: "Student not found." });
      }
  
      console.log("✅ Student Found:", result.rows[0]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("❌ Database Query Error:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  };

// ✅ Update Student Details
export const updateStudent = async (req, res) => {
    try {
        const roll_no = req.params.roll_no;  // Get roll_no from URL
        const { name, department, batch } = req.body;

        console.log("Updating student with roll_no:", roll_no);

        const updatedStudent = await pool.query(
            "UPDATE students SET name = $1, department = $2, batch = $3 WHERE roll_no = $4 RETURNING *",
            [name, department, batch, roll_no]
        );

        if (updatedStudent.rowCount === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student updated successfully", student: updatedStudent.rows[0] });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// ✅ Delete Student by Roll Number and Batch
export const getStudentByRollNoAndBatch = async (req, res) => {
  try {
      const { rollNo, batch } = req.params;
      const result = await pool.query("SELECT * FROM students WHERE roll_no = $1 AND batch = $2", [rollNo, batch]);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: "Student not found" });
      }

      res.json(result.rows[0]);
  } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Server error" });
  }
};


export const deleteBatch = async (req, res) => {
    const { batch, department } = req.body;
  
    if (!batch || !department) {
      return res.status(400).json({ message: "Batch and Department are required" });
    }
  
    try {
      const result = await pool.query(
        "DELETE FROM students WHERE batch = $1 AND department = $2",
        [batch, department]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "No students found for the given batch and department" });
      }
  
      res.status(200).json({ message: "Batch deleted successfully" });
    } catch (error) {
      console.error("Error deleting batch:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

export const deleteBatchStudents = async (req, res) => {
  try {
      const { department, batch } = req.body;

      console.log("📌 Deleting batch:", department, batch); // Debug log

      // Ensure department and batch are provided
      if (!department || !batch) {
          return res.status(400).json({ message: "Department and batch are required." });
      }

      // Check if students exist before deleting
      const checkStudents = await pool.query(
          "SELECT * FROM students WHERE department = $1 AND batch = $2",
          [department.trim(), batch.trim()]
      );

      if (checkStudents.rowCount === 0) {
          return res.status(404).json({ message: "Students not found." });
      }

      // Delete all students from the given department and batch
      const result = await pool.query(
          "DELETE FROM students WHERE department = $1 AND batch = $2 RETURNING *",
          [department.trim(), batch.trim()]
      );

      res.json({
          message: `${result.rowCount} students deleted successfully.`,
          deletedStudents: result.rows,
      });

  } catch (error) {
      console.error("❌ Error deleting batch:", error);
      res.status(500).json({ message: "Server error." });
  }
};

