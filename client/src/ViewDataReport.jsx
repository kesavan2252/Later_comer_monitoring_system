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

  // Function to format date and time in IST
  const formatDateTimeIST = (dateString, timeString) => {
    if (!dateString || !timeString) return "Invalid Date";

    try {
      // Split time into components
      const [time, period] = timeString.trim().split(/(\s+)/).filter(Boolean);
      const [hours, minutes, seconds] = time.split(":");
      let hour = parseInt(hours, 10);

      // Convert 12-hour to 24-hour format
      if (period.trim().toUpperCase() === "PM" && hour !== 12) hour += 12;
      if (period.trim().toUpperCase() === "AM" && hour === 12) hour = 0;

      // Create a Date object from the UTC date and time
      const date = new Date(dateString);
      date.setUTCHours(hour, parseInt(minutes, 10), parseInt(seconds, 10), 0);

      if (isNaN(date.getTime())) {
        console.error("Invalid date or time string:", `${dateString} ${timeString}`);
        return "Invalid Date";
      }

      // Convert UTC to IST (add 5 hours and 30 minutes)
      const istOffsetMs = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const istTimeMs = date.getTime() + istOffsetMs;

      // Create a new Date object for IST
      const istDate = new Date(istTimeMs);

      // Format the date and time manually
      const day = String(istDate.getDate()).padStart(2, "0");
      const month = String(istDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const year = istDate.getFullYear();
      let rawHours = istDate.getHours(); // Raw hours for AM/PM determination
      const displayMinutes = String(istDate.getMinutes()).padStart(2, "0");
      const displaySeconds = String(istDate.getSeconds()).padStart(2, "0");

      // Determine AM/PM based on raw hours
      const displayPeriod = rawHours >= 12 ? "PM" : "AM";

      // Convert to 12-hour format
      let displayHours = rawHours % 12 || 12; // Convert 0 to 12 for midnight/noon
      displayHours = String(displayHours).padStart(2, "0");

      return `${day}/${month}/${year} ${displayHours}:${displayMinutes}:${displaySeconds} ${displayPeriod}`;
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
          console.log(`Row ${index}: date=${row.date}, time=${row.time}, Converted=${formatDateTimeIST(row.date, row.time)}`);
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
      "Date & Time (IST)": formatDateTimeIST(row.date, row.time), // Use both date and time
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
      formatDateTimeIST(row.date, row.time), // Use both date and time
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
            < Back
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
                  <td className="py-3 px-6">{formatDateTimeIST(row.date, row.time)}</td>
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
