import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/Sidebar";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Improved date formatting function
  const formatDateTime = (dateStr) => {
    if (!dateStr || dateStr.trim() === "") return "Invalid Date";
    
    try {
      // If it's already in the correct format, return as-is
      if (dateStr.includes(":")) return dateStr;
      
      // Parse the date string
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      // Format with Indian timezone
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!startDate || !endDate) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/attendance/filter`,
          {
            params: {
              startDate: new Date(startDate).toISOString().split('T')[0],
              endDate: new Date(endDate).toISOString().split('T')[0]
            }
          }
        );

        // Process the data with proper date formatting
        const processedData = response.data.map(item => ({
          ...item,
          formattedDate: formatDateTime(item.date)
        }));

        setTableData(processedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || "Failed to fetch attendance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const exportToExcel = () => {
    const dataForExport = tableData.map((row) => ({
      "Roll No": row.roll_no,
      "Name": row.name,
      "Department": row.department,
      "Date & Time (IST)": row.formattedDate,
      "Status": row.status,
      "Batch": row.batch
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    
    // Generate Excel file with proper timestamp in filename
    const fileName = `Attendance_Report_${startDate}_to_${endDate}_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}`;
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text(`Attendance Report (${startDate} to ${endDate})`, 14, 15);
    
    // Report generation timestamp
    doc.setFontSize(10);
    doc.text(
      `Generated on: ${new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata'
      })} IST`,
      14,
      22
    );

    // Table data
    const tableColumn = [
      "Roll No",
      "Name",
      "Department",
      "Date & Time (IST)",
      "Status",
      "Batch"
    ];
    
    const tableRows = tableData.map((row) => [
      row.roll_no,
      row.name,
      row.department,
      row.formattedDate,
      row.status,
      row.batch
    ]);

    // AutoTable configuration
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      columnStyles: {
        3: { cellWidth: 25 } // Wider column for date/time
      }
    });

    // Save with timestamp
    const fileName = `Attendance_Report_${startDate}_to_${endDate}_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}`;
    
    doc.save(`${fileName}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 ml-5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 ml-5 flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 ml-5">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Back
          </button>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center"
            >
              Export
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={exportToExcel}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-center text-2xl font-semibold text-gray-700 mb-6">
          Showing results from {startDate} to {endDate}
        </h2>

        {tableData.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-gray-600">No attendance records found for the selected date range.</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="py-3 px-4 text-left">Roll No</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-left">Date & Time (IST)</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Batch</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr 
                    key={index} 
                    className={`border-b hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-3 px-4">{row.roll_no}</td>
                    <td className="py-3 px-4">{row.name}</td>
                    <td className="py-3 px-4">{row.department}</td>
                    <td className="py-3 px-4">{row.formattedDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        row.status === 'On-Time' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{row.batch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDataReport;
