import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const DepartmentReport = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [reportData, setReportData] = useState([]);
  const [error, setError] = useState("");

  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AI&DS"];
  const batches = ["2021-2025", "2022-2026", "2023-2027", "2024-2028", "2025-2029"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!selectedDept || !selectedBatch || !startDate || !endDate) {
      toast.warn("⚠️ Please fill in all fields.", { position: "top-right", autoClose: 3000 });
      return;
    }
  
    // Convert dates to UTC before sending
    const startUtc = new Date(startDate).toISOString().split("T")[0]; // YYYY-MM-DD format
    const endUtc = new Date(endDate).toISOString().split("T")[0];
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/attendance/department-report?department=${selectedDept}&batch=${selectedBatch}&startDate=${startUtc}&endDate=${endUtc}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.length === 0) {
          toast.info(`❌ No records found for ${selectedDept} (${selectedBatch}) from ${startUtc} to ${endUtc}.`, { position: "top-right", autoClose: 3000 });
          setReportData([]);
        } else {
          setReportData(data);
          toast.success(`✅ Report generated successfully!`, { position: "top-right", autoClose: 3000 });
        }
      } else {
        toast.error(data.error || "❌ Failed to fetch data.", { position: "top-right", autoClose: 3000 });
      }
    } catch {
      toast.error("⚠️ Network error: Unable to connect to server.", { position: "top-right", autoClose: 3000 });
    }
  };
     
  

  const exportToPDF = () => {
    if (reportData.length === 0) {
      toast.warn("⚠️ No data to export!", { position: "top-right" });
      return;
    }
  
    const doc = new jsPDF();
    doc.text("Department Wise Report", 10, 10);
    doc.text(`Total Students: ${reportData.length}`, 10, 20);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 10, 30);
  
    const tableColumn = ["Roll No", "Name", "Department", "Date", "Time", "Status"];
    const tableRows = reportData.map((row) => {
      const istDate = new Date(row.ist_date); // Ensure it's a Date object
      return [
        row.roll_no,
        row.name,
        row.department,
        istDate.toLocaleDateString("en-GB"), // Corrected date format
        istDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }), // Corrected time format
        row.status,
      ];
    });
    
  
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40 });
    doc.save("department_report.pdf");
  
    toast.success("✅ PDF exported successfully!", { position: "top-right" });
  };
  
  

  const exportToExcel = () => {
    if (reportData.length === 0) {
      toast.warn("⚠️ No data to export!", { position: "top-right" });
      return;
    }
  
    const formattedData = reportData.map((row) => ({
      "Roll No": row.roll_no,
      Name: row.name,
      Department: row.department,
      "Date": new Date(row.ist_date).toLocaleDateString("en-GB"),
      "Time": new Date(row.ist_date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
      Status: row.status,
    }));
  
    const ws = XLSX.utils.json_to_sheet([
      { A: `Total Students: ${reportData.length}` },
      { A: `Date Range: ${startDate} to ${endDate}` },
      {},
      ...formattedData
    ], { skipHeader: true });
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
  
    XLSX.writeFile(wb, "department_report.xlsx");
    toast.success("✅ Excel file exported successfully!", { position: "top-right" });
  };
  
  

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <ToastContainer />

      <div className="flex-1 ml-1 relative">
        <div className="bg-[#C3DBE8] min-h-[590px] p-0 w-[1125px] mt-1 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-800 text-center mt-4 mb-8">Department Wise Report</h1>

          {error && (
            <div className="absolute top-4 right-4 bg-red-100 text-red-800 p-3 rounded-md shadow-md border-l-4 border-red-500">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 rounded-lg max-w-2xl mx-auto">
            <div className="mb-4">
              <label className="block text-blue-600 font-medium mb-2">Select Department:</label>
              <select className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="">-- Select --</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Date Range Section */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-blue-600 font-medium mb-2">From Date:</label>
                <input type="date" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-blue-600 font-medium mb-2">To Date:</label>
                <input type="date" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

          
            {/* Batch Selection */}
            <div className="mb-4">
              <label className="block text-blue-600 font-medium mb-2">Select Batch:</label>
              <select className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                <option value="">-- Select --</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition">Generate Report</button>

            {/* Success Message */}
             {reportData.length > 0 && (
               <p className="text-green-600 text-lg font-semibold text-center mt-4">
                 Report generated successfully for {selectedDept} ({selectedBatch}) from {startDate} to {endDate}.
               <span>You can download the report as PDF or Excel below.</span>
               </p>
               
             )}

          </form>

          <div className="absolute bottom-6 right-6 flex gap-4">
            <button onClick={exportToPDF} className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">Export PDF</button>
            <button onClick={exportToExcel} className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">Export Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default DepartmentReport;
