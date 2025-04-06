import { useState } from "react";
import axios from "axios"; // ✅ Added Axios for backend connection
import Sidebar from "./components/Sidebar";

const ImportIndividual = () => {
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("token"); // Retrieve stored token


      if (!token) {
        console.error("No token found. User is not authenticated.");
        return;
      }
      
  
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/students`,
        { rollNo, name, department, batch },
        {
          headers: {
            Authorization: `Bearer ${token}`,  //Ensure token is sent
            "Content-Type": "application/json",
            
          },
        }
      );
      
  
      console.log("Data submitted successfully:", response.data);
  
      // ✅ Show success message
      setPopupMessage("Student added successfully!");
      setIsError(false);
      setShowPopup(true);
  
      // Auto-hide popup after 3 seconds
      setTimeout(() => setShowPopup(false), 3000);
  
    } catch (error) {
      console.error("Error submitting data:", error.response ? error.response.data : error.message);
  
      if (error.response && error.response.status === 400 && error.response.data.message === "Roll No already exists") {
        // ✅ Show warning for duplicate Roll No
        setPopupMessage("⚠️ Roll No already exists! Please enter a unique Roll No.");
        setIsError(true);
        setShowPopup(true);
  
        // Auto-hide popup after 3 seconds
        setTimeout(() => setShowPopup(false), 3000);
      } else {
        // ✅ Show generic error message
        setPopupMessage("Something went wrong. Please try again.");
        setIsError(true);
        setShowPopup(true);
  
        // Auto-hide popup after 3 seconds
        setTimeout(() => setShowPopup(false), 3000);
      }
    }
  
    // Reset form
    setRollNo("");
    setName("");
    setDepartment("");
    setBatch("");
  };
  


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="bg-[#C3DBE8] mt-1 ml-1 mr-1 mb-1 min-h-[565px] w-[90%] rounded-lg p-3">
        <div className="flex-1 p-10 mr-150 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Students Details Entry (Individual)
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Roll No:</label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Department:</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="CIVIL">CIVIL</option>
                <option value="MECH">MECH</option>
                <option value="AIDS">AIDS</option>

              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Select Batch:</label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Batch</option>
                <option value="2021-2025">2021-2025</option>
                <option value="2022-2026">2022-2026</option>
                <option value="2023-2027">2023-2027</option>
                <option value="2024-2028">2024-2028</option>
                <option value="2025-2029">2025-2029</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-md transition duration-300"
            >
              Submit
            </button>
          </form>

         {/* ✅ Warning & Success Popup Message */}
          {showPopup && (
            <div
              className={`fixed top-5 right-10 px-4 py-2 rounded-md shadow-lg transition-all duration-300 ${
                isError ? "bg-red-500" : "bg-green-500"
              } text-white`}
            >
              {popupMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportIndividual;
