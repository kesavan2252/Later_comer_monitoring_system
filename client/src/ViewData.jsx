import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const ViewData = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/view-data/results", {
      state: { startDate, endDate },
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 ml-2 mt-1 mr-1 bg-blue-200 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
          View Data
        </h1>

        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-lg max-w-xl mx-auto"
        >
          {/* Date Range Inputs */}
          <div className="flex gap-6 mt-6">
            <div className="w-1/2 ">
              <label className="block text-blue-600 font-medium mb-2">
                From:
              </label>
              <input
                type="date"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="w-1/2">
              <label className="block text-blue-600 font-medium mb-2">
                To:
              </label>
              <input
                type="date"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white mt-3 px-6 py-2 rounded-full w-32 mx-auto block hover:bg-purple-700 transition"
          >
            View
          </button>
        </form>
      </div>
    </div>
  );
};

export default ViewData;
