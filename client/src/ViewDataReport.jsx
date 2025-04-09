import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ViewDataReport = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { startDate, endDate } = state || {};
  const [tableData, setTableData] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to format date and time in IST (adapted from StudentReportDetails)
  const formatDateTimeIST = (dateString) => {
  if (!dateString) return "Invalid Date";

  try {
    // Create a Date object from the input string (assumed to be in UTC+8)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Invalid Date";
    }

    // Adjust for IST (UTC+5:30)
    // Southeast Asia (UTC+8) to IST (UTC+5:30) = -2 hours and -30 minutes
    const istOffset = 5.5 * 60; // IST offset in minutes (5 hours 30 minutes)
    const southeastAsiaOffset = 8 * 60; // Southeast Asia offset in minutes (8 hours)
    const timeDifference = southeastAsiaOffset - istOffset; // Difference in minutes (150 minutes)

    // Subtract the time difference to convert to IST
    const istDate = new Date(date.getTime() - timeDifference * 60 * 1000);

    // Format the date and time manually to match your desired output
    const day = String(istDate.getUTCDate()).padStart(2, "0");
    const month = String(istDate.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = istDate.getUTCFullYear();
    let hours = istDate.getUTCHours();
    const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");
    const seconds = String(istDate.getUTCSeconds()).padStart(2, "0");
    
    // Convert to 12-hour format with AM/PM
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight/noon
    hours = String(hours).padStart(2, "0");

    // Return formatted string in "DD/MM/YYYY HH:MM:SS AM/PM" format
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${period}`;
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
        response.data.forEach((row, index) => {
          console.log(`Row ${index}: date=${row.date}, time=${row.time}`);
        });

        setTableData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const exportToExcel = () => {
    const dataForExport = tableData.map((row) => ({
      RollNo: row.roll_no,
      Name: row.name,
      Department: row.department,
      "Date & Time (IST)": formatDateTimeIST(row.date), // Use only row.date
      Batch: row.batch,
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report (${startDate} to ${endDate})`, 20, 10);

    const tableColumn = ["Roll No", "Name", "Department", "Date & Time (IST)", "Batch"];
    const tableRows = tableData.map((row) => [
      row.roll_no,
      row.name,
      row.department,
      formatDateTimeIST(row.date), // Use only row.date
      row.batch,
    ]);

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
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            &lt; Back
          </button>
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
                  <td className="py-3 px-6">{formatDateTimeIST(row.date)}</td>
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
