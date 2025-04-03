import { useState } from "react";
import Sidebar from "./components/Sidebar"; 
import { useNavigate } from "react-router-dom";

const StudentReport = () => {
  const [rollNo, setRollNo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate > today) {
      alert("Start date cannot be in the future!");
      return;
    }
    setStartDate(selectedDate);
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate > today) {
      alert("End date cannot be in the future!");
      return;
    }
    setEndDate(selectedDate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Pass user input data to the next page via state
    navigate("/reports/student/details", { state: { rollNo, startDate, endDate } });
  };

  return (
    <div className="flex min-h-screen ">
      <Sidebar />
      
      <div className="flex-1 p-10 ml-1 mt-1 mr-1 bg-blue-200 ">
        <h1 className="text-2xl font-semibold ml-90 text-gray-700 mb-6">Student Wise Report</h1>

        <form onSubmit={handleSubmit} className=" p-6 mt-20 max-w-lg mx-auto space-y-4">
          <div>
            <label className="block text-blue-600 font-medium">Enter Roll No:</label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
              className="w-[300px] border p-2 rounded-full focus:ring focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-600 font-medium">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                max={today} // Prevents future date selection
                required
                className="w-full border p-2 rounded-full focus:ring focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-blue-600 font-medium">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                max={today} // Prevents future date selection
                required
                className="w-full border p-2 rounded-full focus:ring focus:ring-indigo-300"
              />
            </div>
          </div>

          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentReport;
