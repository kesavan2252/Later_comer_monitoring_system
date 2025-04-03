import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar"; 
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import api from "./api"; // Import API instance

const Reports = () => {
  const [rollNo, setRollNo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  // Function to check if Roll No. exists in the database
  const checkRollNoExists = async (rollNo) => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/students/${rollNo}`
      );
      return res.data.exists; // Returns true if exists, false otherwise
    } catch (error) {
      console.error("❌ Error checking Roll No.:", error);
      return false;
    }
  };

  // Function to validate the form
  const validateForm = async () => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    if (!rollNo.trim()) {
      toast.error("Roll No. cannot be empty!", { position: "top-right" });
      return false;
    }

    const rollExists = await checkRollNoExists(rollNo);
    if (!rollExists) {
      toast.error("Invalid Roll No.!", { position: "top-right" });
      return false;
    }

    if (!startDate) {
      toast.error("Please select a start date!", { position: "top-right" });
      return false;
    }

    if (!endDate) {
      toast.error("Please select an end date!", { position: "top-right" });
      return false;
    }


    return true;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm()) {
      navigate(`/reports/student?rollNo=${rollNo}&start=${startDate}&end=${endDate}`);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar/>
            {/* Content */}
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-semibold text-gray-700 mb-6">Student Wise Report</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
          <ToastContainer /> {/* Notification Container */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-medium">Enter Roll No:</label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
                className="w-full border p-2 rounded-md focus:ring focus:ring-indigo-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-medium">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full border p-2 rounded-md focus:ring focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full border p-2 rounded-md focus:ring focus:ring-indigo-300"
                />
              </div>
            </div>

            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reports;
