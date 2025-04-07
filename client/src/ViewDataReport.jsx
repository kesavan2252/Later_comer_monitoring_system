import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Correct import

const ViewDataReport = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { startDate, endDate } = state || {};
  const [tableData, setTableData] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Utility: Convert 12-hour time to 24-hour format if needed
  const convertTo24Hour = (time12h) => {
    if (!time12h) return "00:00:00";
    if (!time12h.toUpperCase().includes("AM") && !time12h.toUpperCase().includes("PM"))
      return time12h; // assume it's already 24-hour
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes, seconds] = time.split(":");
    hours = parseInt(hours, 10);
    if (modifier.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (modifier.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }
    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
  };

  // Convert given dateStr and timeStr (in UTC+8) to IST (UTC+5:30)
  const formatDateTimeIST = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "Invalid Date";

    try {
      // If timeStr is in 12-hour format, convert it to 24-hour.
      const time24 = convertTo24Hour(timeStr);

      // Parse the date and time parts (assume dateStr is "YYYY-MM-DD" and time24 is "HH:mm:ss")
      const [year, month, day] = dateStr.split("-").map(Number);
      const [h, m, s] = time24.split(":").map(Number);

      // Create a UTC timestamp from the provided date and time as if it were in UTC+8.
      // Since our values are in UTC+8, subtract 8 hours to get the true UTC.
      const utcTimestamp = Date.UTC(year, month - 1, day, h, m, s) - (8 * 60 * 60 * 1000);

      // Now, convert UTC to IST by adding 5.5 hours.
      const istTimestamp = utcTimestamp + (2.5 * 60 * 60 * 1000);
      const istDate = new Date(istTimestamp);

      // Format the date in 12-hour format with AM/PM using toLocaleString,
      // forcing the timeZone "Asia/Kolkata" to be safe.
      return istDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("IST conversion error:", error);
      return "Invalid Date";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!startDate || !endDate) return;

      try {
        const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
        const formattedEndDate = dayjs(endDate).format("YYYY-MM-DD");

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/attendance/filter?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        );

        console.log("Fetched Data:", response.data);

        // We assume backend sends separate date and time fields.
        // No further mapping is required if backend data is valid.
        setTableData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  // Export as Excel
  const exportToExcel = () => {
    const dataForExport = tableData.map((row) => ({
      RollNo: row.roll_no,
      Name: row.name,
      Department: row.department,
      "Date & Time (IST)": formatDateTimeIST(row.date, row.time),
      Batch: row.batch,
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
  };

  // Export as PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report (${startDate} to ${endDate})`, 20, 10);

    const tableColumn = ["Roll No", "Name", "Department", "Date & Time (IST)", "Batch"];
    const tableRows = [];

    tableData.forEach((row) => {
      tableRows.push([
        row.roll_no,
        row.name,
        row.department,
        formatDateTimeIST(row.date, row.time),
        row.batch,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`Attendance_Report_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 ml-5">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            &lt; Back
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Export ▼
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
                <button
                  onClick={exportToExcel}
                  className="block w-full text-left px-4 py-2 hover:bg-blue-200 cursor-pointer"
                >
                  Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="block w-full text-left px-4 py-2 hover:bg-blue-200 cursor-pointer"
                >
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-center text-2xl font-semibold text-gray-700 mb-6">
          Showing results from {startDate} to {endDate}
        </h2>

        {/* Table */}
        <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="py-3 px-6 text-left">Roll No</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Department</th>
                <th className="py-3 px-6 text-left">Date & Time (IST)</th>
                <th className="py-3 px-6 text-left">Batch</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-100 transition">
                  <td className="py-3 px-6">{row.roll_no}</td>
                  <td className="py-3 px-6">{row.name}</td>
                  <td className="py-3 px-6">{row.department}</td>
                  <td className="py-3 px-6">
                    {formatDateTimeIST(row.date, row.time)}
                  </td>
                  <td className="py-3 px-6">{row.batch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewDataReport;
