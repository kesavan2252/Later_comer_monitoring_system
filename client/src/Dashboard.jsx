import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";

const Dashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [refresh, setRefresh] = useState(false); // Trigger refresh

  const fetchDepartmentCounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/department-counts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      window.dispatchEvent(new Event("refreshDashboard"));
      const data = await response.json();
      const allDepartments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AI&DS"].map((dept) => ({
        name: dept,
        count: data.find((entry) => entry.department === dept)?.count || 0,
      }));

      setDepartments(allDepartments);
    } catch (error) {
      console.error("Error fetching department counts:", error);
    }
  };

  useEffect(() => {
    fetchDepartmentCounts();
  }, [refresh]); // Refresh when `refresh` state changes

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-2">
        <div className="bg-[#C3DBE8] min-h-[565px] rounded-lg p-3">
          <h1 className="text-[26px] font-bold text-[#007B83] mb-8 pl-12 pt-5">
            Delayed Arrivals
          </h1>

          <div className="grid grid-cols-3 gap-6 max-w-[950px]">
            {departments.map((dept, index) => (
              <div
                key={index}
                className={`bg-white h-[180px] w-[250px] ml-8 rounded-lg shadow-md p-4 flex flex-col justify-between transition-shadow duration-300`}
              >
                <div className="text-[22px] ml-2 text-[#6c5ce7] font-medium">
                  {dept.name}
                </div>
                <div className="text-[45px] ml-[38px] text-[#2d2d2d] font-bold">
                  {dept.count}
                </div>
              </div>
            ))}
          </div>

          {/* Button to Manually Refresh */}
          <button
            style={{ cursor: "pointer" }}
            onClick={() => setRefresh((prev) => !prev)}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            title="Click to refresh data"
          >
            Refresh Data
          </button>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
