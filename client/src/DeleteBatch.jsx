import { useState } from "react";
import Sidebar from "./components/Sidebar";

const DeleteBatch = () => {
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // ✅ New state for success message

  // Retrieve token from localStorage
  const token = localStorage.getItem("token");

  // Function to handle Delete Button Click
  const handleDelete = () => {
    if (!batch || !department) {
      setError("❌ Please select both Batch and Department.");
      return;
    }
    setError(""); // Clear previous error
    setShowConfirmation(true);
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    try {
      console.log(`📌 Deleting batch: ${department} - ${batch}`);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/students/${department}/${batch}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );     

      const data = await response.json();
      console.log("📌 API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete batch");
      }

      setSuccessMessage(`✅ ${data.message}`);
      setShowConfirmation(false); // ✅ Hide confirmation popup
      setBatch(""); // ✅ Reset batch selection
      setDepartment(""); // ✅ Reset department selection
    } catch (error) {
      console.error("❌ Error deleting batch:", error);
      setError(error.message || "Failed to delete batch.");
    }
  };

  return (
    <div className="flex bg-gray-200 min-h-screen">
      <Sidebar />

      {/* Main Content */}
      <div className="bg-[#C3DBE8] min-h-[565px] w-[1110px] rounded-lg mt-1 ml-1 p-3">
        <div className="p-8 ">
          <h1 className="text-2xl font-bold mb-4">Delete Students Details (Batch)</h1>

          {/* Batch Selection */}
          <label className="block text-lg font-medium">Select Batch:</label>
          <select
            className="w-full p-2 border rounded-md mt-2"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
          >
            <option value="">Select Batch</option>
            <option value="2021-2025">2021-2025</option>
            <option value="2022-2026">2022-2026</option>
            <option value="2023-2027">2023-2027</option>
            <option value="2024-2028">2024-2028</option>
            <option value="2025-2029">2025-2029</option>
          </select>

          {/* Department Selection */}
          <label className="block mt-4 text-lg font-medium">Select Department:</label>
          <select
            className="w-full p-2 border rounded-md mt-2"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          {/* Success and Error Messages */}
          {successMessage && <p className="text-green-600 mt-2">{successMessage}</p>}
          {error && <p className="text-red-500 mt-2">{error}</p>}

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-6 py-2 rounded-md mt-4"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Confirmation Popup with Overlay */}
      {showConfirmation && (
        <>
          {/* Overlay to prevent outside clicks */}
          <div className="fixed inset-0 bg-transparent bg-opacity-50 z-40"></div>

          {/* Confirmation Box */}
          <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-md shadow-lg z-50">
            <p className="text-lg font-medium mb-4">Are you sure you want to delete?</p>
            <div className="flex justify-between">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-md"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md"
              >
                No
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeleteBatch;
