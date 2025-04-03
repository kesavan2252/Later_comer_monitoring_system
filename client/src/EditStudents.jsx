import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";

const EditStudent = () => {
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rollNoError, setRollNoError] = useState("");

  // Function to handle search
  const handleSearch = async () => {
    if (!rollNo.trim()) {
      setRollNoError("⚠️ Please enter a Roll Number.");
      return;
    }

    setRollNoError("");
    setErrorMessage("");

    try {
      console.log("🔍 Searching for Roll No:", rollNo);

      // Retrieve token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("⚠️ Unauthorized access. Please login again.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/students/${rollNo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setErrorMessage("⚠️ Unauthorized. Please login again.");
        return;
      }

      if (response.status === 404) {
        console.log("❌ Student not found!");
        setErrorMessage("⚠️ Student not found in any batch.");
        setStudent(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again later.");
      }

      const data = await response.json();
      console.log("✅ Student Data:", data);
      setStudent(data);
    } catch (error) {
      console.error("❌ Error fetching student:", error);
      setErrorMessage(error.message);
    }
  };

  // Function to handle update with validation
  const handleUpdate = async () => {
    if (!student.name || !student.department || !student.batch) {
      setErrorMessage("⚠️ All fields must be filled out before updating.");
      return;
    }

    setErrorMessage("");

    try {
      console.log("Updating Student with Roll No:", student.roll_no);

      // Retrieve token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("⚠️ Unauthorized access. Please login again.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/students/${student.roll_no}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: student.name,
          department: student.department,
          batch: student.batch,
        }),
      });

      if (response.status === 401) {
        setErrorMessage("⚠️ Unauthorized. Please login again.");
        return;
      }

      if (!response.ok) {
        throw new Error("❌ Failed to update student.");
      }

      setIsUpdated(true);
      setTimeout(() => setIsUpdated(false), 2000);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex bg-gray-200 min-h-screen">
      <Sidebar />

      {/* Main Content */}
      <div className="bg-[#C3DBE8] min-h-[565px] w-[1110px] rounded-lg mt-1 ml-1 p-3">
        <div className="flex-1 p-8 rounded-lg ml-40 mr-50 ">
          <h1 className="text-2xl font-bold mb-4">Edit Student Details</h1>

          {/* Search Section */}
          {!student ? (
            <div>
              <label className="block text-lg font-medium">Enter Roll No:</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md mt-2"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
              />
              {rollNoError && <p className="text-red-500 mt-2">{rollNoError}</p>}

              <button
                onClick={handleSearch}
                className="bg-red-400 text-white px-6 py-2 rounded-md mt-4"
              >
                View
              </button>
            </div>
          ) : (
            <div>
              {/* Back Button */}
              <button
                onClick={() => {
                  setStudent(null);
                  setRollNo("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mb-4"
              >
                ← Back
              </button>

              {/* Roll No (Non-Editable) */}
              <label className="block font-medium">Roll No:</label>
              <input
                type="text"
                className="w-full p-2 border text-gray rounded-md bg-gray-200"
                value={student.roll_no}
                readOnly
              />

              {/* Name (Editable) */}
              <label className="block mt-4 font-medium">Name:</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={student.name}
                onChange={(e) => setStudent({ ...student, name: e.target.value })}
              />

              {/* Department (Editable) */}
              <label className="block mt-4 font-medium">Department:</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={student.department}
                    onChange={(e) => setStudent({ ...student, department: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="AIDS">AIDS</option>
                  </select>


              {/* Batch Selection */}
              <label className="block mt-4 font-medium">Select Batch:</label>
              <select
                className="w-full p-2 border rounded-md"
                value={student.batch}
                onChange={(e) => setStudent({ ...student, batch: e.target.value })}
              >
                <option value="2021-2025">2021-2025</option>
                <option value="2022-2026">2022-2026</option>
                <option value="2023-2027">2023-2027</option>
                <option value="2024-2028">2024-2028</option>
                <option value="2025-2029">2025-2029</option>
              </select>

              {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

              {/* Update Button */}
              <button
                onClick={handleUpdate}
                className="bg-red-400 text-white px-6 py-2 rounded-md mt-6"
              >
                Change
              </button>
            </div>
          )}

          {isUpdated && (
            <div className="fixed top-10 right-3 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-md">
              Updated Successfully!
            </div>
          )}

          {errorMessage && <p className="text-red-500 bg-yellow-100 p-2 mt-2 rounded">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default EditStudent;
