import pool from "../config/db.js";
import cron from "node-cron";
import nodemailer from "nodemailer";
import { DateTime } from "luxon";
// @desc Get latecomer count per department
// @route GET /api/attendance/department-count
export const getDepartmentCounts = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

        const query = `
            SELECT s.department, COUNT(*) as count
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.date::date = $1
            GROUP BY s.department
            ORDER BY s.department;
        `;

        const values = [today];
        const result = await pool.query(query, values);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching department counts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// @desc Mark attendance for a student
// @route POST /api/attendance/mark-attendance
// Email Config
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "kesavan.scemdu@gmail.com",
        pass: "Sce12456.1",
    },
});

// Mark Attendance with Late Status
export const markAttendance = async (req, res) => {
    try {
        const { roll_no } = req.body;
        if (!roll_no) return res.status(400).json({ error: "Roll Number is required" });

        const now = new Date();
        const currentISTDate = now.toISOString().split("T")[0];
        const currentTimeIST = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false });

        const studentQuery = await pool.query("SELECT id, name, department FROM students WHERE roll_no = $1", [roll_no]);
        if (studentQuery.rows.length === 0) return res.status(404).json({ error: "Student not found" });

        const { id: studentId, department } = studentQuery.rows[0];
        const name = studentQuery.rows[0].name.trim(); // Trim the name to remove spaces

        // Check if attendance already exists for today
        const existingRecord = await pool.query(
            "SELECT * FROM attendance WHERE student_id = $1 AND date::date = $2",
            [studentId, currentISTDate]
        );

        // Determine status: Late if after 9:15 AM
        const status = currentTimeIST >= "09:15:00" ? "Late" : "On-Time";

        let attendanceRecord;
        if (existingRecord.rows.length > 0) {
            attendanceRecord = await pool.query(
                `UPDATE attendance SET date = NOW(), status = $1 
                 WHERE student_id = $2 AND date::date = $3 
                 RETURNING *`,
                [status, studentId, currentISTDate]
            );
        } else {
            attendanceRecord = await pool.query(
                `INSERT INTO attendance (student_id, department, date, status, roll_no) 
                 VALUES ($1, $2, NOW(), $3, $4) 
                 RETURNING *`,
                [studentId, department, status, roll_no]
            );
        }

        // Return name and department explicitly
        return res.status(201).json({ 
            message: "Attendance marked successfully!", 
            record: { 
                ...attendanceRecord.rows[0], 
                name: name,  // Ensure name is included in response
                department: department
            } 
        });

    } catch (error) {
        console.error("Error marking attendance:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// 🕚 Schedule Report Emails at 11:45 AM
cron.schedule("45 11 * * *", async () => {
    try {
        const today = new Date().toISOString().split("T")[0];

        // Get Department-wise Attendance
        const departmentAttendance = await pool.query(
            "SELECT department, roll_no, status, date FROM attendance WHERE date::date = $1",
            [today]
        );

        if (departmentAttendance.rows.length === 0) return;

        // Group by Department
        const departmentReports = departmentAttendance.rows.reduce((acc, record) => {
            acc[record.department] = acc[record.department] || [];
            acc[record.department].push(record);
            return acc;
        }, {});

        // Send Emails to Department Officials
        for (const dept in departmentReports) {
            const deptEmail = getDepartmentEmail(dept);
            if (!deptEmail) continue;

            await transporter.sendMail({
                from: "your-email@gmail.com",
                to: deptEmail,
                subject: `Daily Attendance Report - ${dept}`,
                text: JSON.stringify(departmentReports[dept], null, 2),
            });
        }

        // Send Consolidated Report to ED
        await transporter.sendMail({
            from: "your-email@gmail.com",
            to: "ed-email@example.com",
            subject: "All Department Attendance Report",
            text: JSON.stringify(departmentAttendance.rows, null, 2),
        });

        console.log("✅ Reports sent successfully!");
    } catch (error) {
        console.error("❌ Error sending reports:", error);
    }
});

// Function to Get Department Email (Replace with actual emails)
const getDepartmentEmail = (department) => {
    const departmentEmails = {
        "CSE": "kesavan.scemdu@gmail.com",
        "ECE": "ece-dept@example.com",
        "MECH": "mech-dept@example.com",
    };
    return departmentEmails[department] || null;
};



// @desc Get student attendance report
// @route GET /api/attendance/report
export const getStudentReport = async (req, res) => {
    try {
        const { roll_no, start_date, end_date } = req.query;

        // Check if student exists
        const studentResult = await pool.query("SELECT id, name, department FROM students WHERE roll_no = $1", [roll_no]);

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const student = studentResult.rows[0];

        // Fetch attendance records within the date range
        const attendanceQuery = `
            SELECT date, status
            FROM attendance
            WHERE student_id = $1
            AND date BETWEEN $2 AND $3
            ORDER BY date ASC
        `;

        const attendanceResult = await pool.query(attendanceQuery, [student.id, start_date, end_date]);

        res.status(200).json({
            student: {
                roll_no,
                name: student.name,
                department: student.department,
            },
            attendance: attendanceResult.rows,
        });

    } catch (error) {
        console.error("Error in getStudentReport:", error);
        res.status(500).json({ error: "Server Error" });
    }
};


// @desc Get detailed student attendance report
// @route GET /api/attendance/report/details
export const getStudentAttendanceReport = async (req, res) => {
  try {
      const { roll_no, start_date, end_date } = req.query;
      console.log("Received Query Params:", { roll_no, start_date, end_date });

      if (!roll_no || !start_date || !end_date) {
          return res.status(400).json({ error: "Missing required parameters" });
      }

      const query = `
          SELECT a.date, 
                 s.roll_no, 
                 s.name, 
                 s.department, 
                 CASE 
                   WHEN a.date::time > '09:15:00' THEN 'Late'
                   ELSE 'On-Time'
                 END AS status
          FROM attendance a
          JOIN students s ON a.student_id = s.id
          WHERE s.roll_no = $1
          AND a.date::date BETWEEN $2 AND $3
          ORDER BY a.date ASC;
      `;

      const result = await pool.query(query, [roll_no, start_date, end_date]);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: "No attendance records found" });
      }

      res.json({
          student: {
              roll_no,
              name: result.rows[0].name,
              department: result.rows[0].department,
          },
          attendance: result.rows.map(row => ({
              date: row.date,
              status: row.status
          }))
      });
  } catch (error) {
      console.error("Error fetching student report:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

// @desc Get filtered attendance based on query parameters
// @route GET /api/attendance/filter
export const getFilteredAttendance = async (req, res) => {
  try {
      const { startDate, endDate } = req.query;
      console.log("Received Params:", { startDate, endDate });

      if (!startDate || !endDate) {
          return res.status(400).json({ error: "Start date and end date are required." });
      }

      const result = await pool.query(`
          SELECT 
              a.id, 
              s.roll_no, 
              s.name, 
              s.department, 
              a.date AS full_date, -- Full timestamp
              s.batch,  -- ✅ Corrected from a.batch to s.batch
              a.status
          FROM attendance a
          JOIN students s ON a.student_id = s.id
          WHERE a.date BETWEEN $1::DATE AND $2::DATE + INTERVAL '1 day' - INTERVAL '1 second'
          ORDER BY a.date DESC
      `, [startDate, endDate]);

      // ✅ Format the results: Extract date and time separately
      const formattedResult = result.rows.map(row => {
          const dateObj = new Date(row.full_date);
          return {
              id: row.id,
              roll_no: row.roll_no,
              name: row.name,
              department: row.department,
              date: dateObj.toISOString().split("T")[0], // Extract YYYY-MM-DD
              time: dateObj.toLocaleTimeString("en-US", { hour12: true }), // Format to 12-hour time
              batch: row.batch, // ✅ Ensure batch is included
              status: row.status
          };
      });

      console.log("Formatted Query Result:", formattedResult);
      res.json(formattedResult);

  } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};




export const filterAttendance = async (req, res) => {
  try {
    console.log("Request received with query:", req.query);

    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required." });
    }

    console.log("Executing Query...");
    const result = await pool.query(
      "SELECT * FROM attendance WHERE date::DATE BETWEEN $1 AND $2",
      [startDate, endDate]
    );

    const formattedRows = result.rows.map(row => {
      // Combine date and time to ISO-like string (assume UTC unless known)
      const combinedDateTime = DateTime.fromISO(`${row.date}T${row.time}`, { zone: "utc" })
        .setZone("Asia/Kolkata");

      return {
        ...row,
        datetime_ist: combinedDateTime.toFormat("yyyy-MM-dd hh:mm a")
      };
    });

    console.log("Formatted Query Result:", formattedRows);
    res.json(formattedRows);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: error.message });
  }
};
    console.log("Query Result:", result.rows);  // Check if data is returned
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching attendance:", error);  // See the exact error in terminal
    res.status(500).json({ error: error.message });
  }
};


// Add Attendance Record
export const addAttendance = async (req, res) => {
  const { roll_no, name, department, batch } = req.body;

  if (!roll_no || !name || !department || !batch) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Fetch student_id using roll_no
    const studentResult = await pool.query(
      "SELECT id FROM students WHERE roll_no = $1",
      [roll_no]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const student_id = studentResult.rows[0].id;

    // Check if an attendance record already exists for today
    const today = new Date().toISOString().split("T")[0]; // Get today's date (YYYY-MM-DD)
    const existingRecord = await pool.query(
      "SELECT * FROM attendance WHERE student_id = $1 AND DATE(time) = $2",
      [student_id, today]
    );

    if (existingRecord.rows.length > 0) {
      // Update the last entry's time instead of inserting a new record
      await pool.query(
        "UPDATE attendance SET time = NOW() WHERE student_id = $1 AND DATE(time) = $2",
        [student_id, today]
      );

      return res.status(200).json({
        message: "Attendance updated with latest time!",
        updatedRecord: existingRecord.rows[0],
      });
    }

    // If no previous record exists, insert a new attendance record
    const result = await pool.query(
      "INSERT INTO attendance (student_id, department, status, time) VALUES ($1, $2, 'Late', NOW()) RETURNING *",
      [student_id, department]
    );

    res.status(201).json({
      message: "Attendance recorded successfully",
      record: result.rows[0],
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const getDepartmentReport = async (req, res) => {
    try {
        const { department, batch, startDate, endDate } = req.query;

        if (!department || !batch || !startDate || !endDate) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const query = `
    SELECT 
        s.roll_no, 
        s.name, 
        s.department, 
        s.batch, 
        a.date AT TIME ZONE 'Asia/Kolkata' AS ist_date, 
        a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE 
        s.department = $1 
        AND s.batch = $2 
        AND a.date BETWEEN $3::DATE AND $4::DATE + INTERVAL '1 day' - INTERVAL '1 second'
    ORDER BY a.date ASC
`;


        const values = [department, batch, startDate, endDate];

        const { rows } = await pool.query(query, values);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching department report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



