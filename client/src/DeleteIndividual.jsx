import { useState } from "react";
import Sidebar from "./components/Sidebar";

const DeleteStudent = () => {
  const [rollNo, setRollNo] = useState("");
  const [batch, setBatch] = useState("");
  const [student, setStudent] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [backVisible, setBackVisible] = useState(false);
  const [notification, setNotification] = useState(""); // New state for notification

  const handleSubmit = async () => {
    if (!rollNo.trim() || !batch) {
        setError("Please enter Roll Number and select a Batch.");
        return;
    }

    setError("");
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/students/${rollNo}/${batch}`, 
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Student not found");
        }

        const fetchedStudent = await response.json();
        setStudent(fetchedStudent);
        setBackVisible(true);
    } catch (error) {
        setError("Student not found. Check Roll No and Batch.");
        setStudent(null);
        setBackVisible(false);
    }
};



  const handleClear = () => {
    setRollNo("");
  };

  const handleDelete = async () => {
    if (!student) {
        setError("No student data found. Please check Roll No and Batch.");
        return;
    }
    setShowConfirmation(true);
};


  const confirmDelete = async (choice) => {
    if (choice === "yes") {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/students/${rollNo}/${batch}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Student not found or deletion failed");
            }

            setNotification("Student deleted successfully!");
            setTimeout(() => setNotification(""), 3000); 

            setStudent(null);
            setRollNo("");
            setBatch("");
        } catch (error) {
            console.error("Error deleting student:", error);
            setError("Failed to delete student. Ensure the Roll No and Batch are correct.");
        }
    }
    setShowConfirmation(false);
};


  return (
    <div className="flex bg-gray-200 min-h-screen">
      <Sidebar />

      {/* Main Content */}
      <div className="bg-[#C3DBE8] min-h-[565px] w-[1110px] rounded-lg mt-1 ml-1 p-3">
        <div className="p-8 ">
          <h1 className="text-2xl font-bold mb-4">Delete Students Details (Individual)</h1>

          {/* Roll Number Input */}
          <label className="block text-lg font-medium">Roll No:</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-2 border rounded-md mt-2 pr-10"
              value={rollNo}
              onChange={(e) => {
                const value = e.target.value;
                setRollNo(value);
              }}
              placeholder="Enter Roll No"
            />
            {rollNo && (
              <button className="absolute right-2 top-3 text-gray-500" onClick={handleClear}>
                clear
              </button>
            )}
          </div>

          {/* Batch Selection */}
          <label className="block mt-4 text-lg font-medium">Select Batch:</label>
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

          {/* Back Button */}
          {backVisible && (
            <button
              onClick={() => {
                setRollNo("");
                setBatch("");
                setStudent(null);
                setBackVisible(false);
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-md mt-4"
            >
              Back
            </button>
          )}

          {/* Error Message */}
          {error && <p className="text-red-500 mt-2">{error}</p>}

          {/* Submit Button */}
          <button onClick={handleSubmit} className="bg-green-500 text-white px-6 py-2 ml-4 rounded-md mt-4">
            View
          </button>

          {/* Display Student Data */}
          {student && (
            <div className="mt-6 bg-white p-4 rounded-md shadow-md">
              <h2 className="text-xl font-semibold mb-2">Student Details</h2>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Roll No</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Department</th>
                    <th className="border p-2">Batch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">{student.roll_no}</td>
                    <td className="border p-2">{student.name}</td>
                    <td className="border p-2">{student.department}</td>
                    <td className="border p-2">{student.batch}</td>
                  </tr>
                </tbody>
              </table>

              {/* Delete Button */}
              <button onClick={handleDelete} className="bg-red-500 text-white px-6 py-2 rounded-md mt-4">
                Delete
              </button>
            </div>
          )}

          {/* Confirmation Popup */}
          {showConfirmation && (
            <>
              <div className="fixed inset-0 bg-transparent bg-opacity-30  z-40"></div>

              <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-md shadow-lg z-50">
                <p className="text-lg font-medium mb-4">Are you sure you want to delete?</p>
                <div className="flex justify-between">
                  <button onClick={() => confirmDelete("yes")} className="bg-red-500 text-white px-6 py-2 rounded-md">
                    Yes
                  </button>
                  <button onClick={() => confirmDelete("no")} className="bg-gray-500 text-white px-6 py-2 rounded-md">
                    No
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Notification Box */}
          {notification && (
            <div className="fixed top-5 right-5 bg-green-500 text-white p-4 rounded-md shadow-md z-50">
              {notification}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteStudent;
