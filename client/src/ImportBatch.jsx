import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import Sidebar from "./components/Sidebar";

const ImportBatch = () => {
  const [batch, setBatch] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !batch) {
      toast.error("Please select a batch and upload a file!", { position: "top-right" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("batch", batch);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/students/import`,
        {
          method: "POST",
          body: formData,
        }
      );
    

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "File upload failed");
      }

      toast.success("File uploaded successfully!", { position: "top-right" });
       // Show warning if duplicate records exist
       if (result.skipped && result.skipped.length > 0) {
        toast.warn(
            `Skipped ${result.skipped.length} duplicate entries! (${result.skipped.join(", ")})`,
            { position: "top-right", autoClose: 4000 }
        );
    }

    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Error uploading file!", { position: "top-right" });
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="bg-[#C3DBE8] min-h-[565px] w-[1110px] rounded-lg mt-1 ml-1 p-3">
        <div className="flex-1 p-10 ml-50 mr-80 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Students Details Entry: (Batch)
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md bg-none p-6 rounded-lg">
            {/* Batch Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Select Batch:</label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-200"
              >
                <option value="">Select Batch</option>
                <option value="2021-2025">2021-2025</option>
                <option value="2022-2026">2022-2026</option>
                <option value="2023-2027">2023-2027</option>
                <option value="2024-2028">2024-2028</option>
                <option value="2025-2029">2025-2029</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Upload CSV File:</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-300"
              />
              <p className="text-sm text-gray-600 mt-1">
                Only upload <b><strong>.csv</strong></b> format.<br />
                The file should contain: <b>roll_no, name, department</b><br />
                The batch you selected will be added automatically.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-md transition duration-300"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ImportBatch;
