import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "./components/Sidebar";

const StudentReportDetails = () => {
  const location = useLocation();
  const { rollNo, startDate, endDate } = location.state || {}; // Get state from navigation
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendanceReport = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/attendance/report/details`,
          {
            params: { roll_no: rollNo, start_date: startDate, end_date: endDate },
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        setStudent(response.data.student);
        setAttendance(response.data.attendance);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching data");
      }
    };

    if (rollNo && startDate && endDate) {
      fetchAttendanceReport();
    }
  }, [rollNo, startDate, endDate]);

  const handleBack = () => {
    navigate("/reports/student");
  };

  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
  };

  // Function to format date and time in IST
  const formatDateTimeIST = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const exportToExcel = () => {
    const data = [
      ["Roll No", student.roll_no,"From Date", formatDateTimeIST(startDate)],
      ["Name", student.name,"To Date", formatDateTimeIST(endDate)],
      ["Department", student.department],
      [],
      [],
      ["Date & Time", "Status"],
      ...attendance.map((row) => [formatDateTimeIST(row.date), row.status]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `Attendance_Report_${rollNo}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Student Attendance Report", 20, 10);

    // Adding student details
    doc.setFontSize(12);
    doc.text(`Roll No: ${student.roll_no}`, 20, 20);
    doc.text(`Name: ${student.name}`, 20, 30);
    doc.text(`Department: ${student.department}`, 20, 40);
    doc.text(`From Date: ${formatDateTimeIST(startDate)}`, 130, 20);
    doc.text(`To Date: ${formatDateTimeIST(endDate)}`, 130, 30);

    // Adding a table with attendance details
    autoTable(doc, {
      startY: 50,
      head: [["Date & Time", "Status"]],
      body: attendance.map((row) => [formatDateTimeIST(row.date), row.status]),
    });

    doc.save(`Attendance_Report_${student.roll_no}.pdf`);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-10 ml-1 mr-1 mt-1 bg-blue-200">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleBack} className="bg-blue-400 px-4 font-bold py-2 rounded-lg shadow hover:bg-gray-200">
            &lt; Back
          </button>

          <div className="relative">
            <button onClick={toggleExport} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
              Export ▼
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md">
                <button onClick={exportToPDF} className="block px-4 rounded-lg py-2 w-full hover:bg-red-300">
                  PDF
                </button>
                <button onClick={exportToExcel} className="block px-4 rounded-lg py-2 w-full hover:bg-red-300">
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-700 mb-6">Student Wise Report</h1>

        {error ? (
          <p className="text-red-500 text-lg">{error}</p>
        ) : (
          <>
            {student && (
              <div className="bg-white w-[400px] space-y-2 ml-40 p-6 shadow-md mb-6">
                <p><strong>Roll No:</strong> {student.roll_no}</p>
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Department:</strong> {student.department}</p>
                <p><strong>From Date:</strong> {formatDateTimeIST(startDate)}</p>
                <p><strong>To Date:</strong> {formatDateTimeIST(endDate)}</p>
              </div>
            )}

            {attendance.length > 0 ? (
              <table className="w-full bg-white shadow-md rounded-md">
                <thead className="bg-blue-500 text-white">
                  <tr className="text-center">
                    <th className="p-3">Date & Time (IST)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((entry, index) => (
                    <tr key={index} className="text-center border-t">
                      <td className="p-3">{formatDateTimeIST(entry.date)}</td>
                      <td className="p-3">{entry.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-700 text-lg">No attendance records found.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentReportDetails;
