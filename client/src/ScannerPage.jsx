import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ScannerPage = () => {
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState(null);
    const [manualRollNo, setManualRollNo] = useState("");
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [hardwareStatus, setHardwareStatus] = useState("Checking Scanner...");
    const [currentTime, setCurrentTime] = useState(new Date());
    const inputRef = useRef(null);
    const lastScanTimeRef = useRef(0); // Track the last successful scan time

    // Function to check hardware connection (fallback for serial devices)
    const checkHardware = async () => {
        if ("serial" in navigator) {
            try {
                const ports = await navigator.serial.getPorts();
                if (ports.length > 0) {
                    setHardwareStatus("Serial Device Active");
                } else {
                    setHardwareStatus("No Serial Device Detected");
                }
            } catch (error) {
                console.error("Error checking serial hardware:", error);
                setHardwareStatus("Serial Check Failed");
            }
        } else {
            setHardwareStatus("Serial API Not Supported");
        }
    };

    useEffect(() => {
        checkHardware();
        const interval = setInterval(() => {
            checkHardware();
        }, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    // Update timer every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        showNotification("Logged out successfully!", "info");
    };

    const fetchAttendance = async (rollNo) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/mark-attendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roll_no: rollNo }),
            });

            const data = await response.json();
            if (!response.ok) {
                showNotification(data.error || "Failed to mark attendance.", "error");
                return;
            }

            if (data.record) {
                setScannedData({
                    roll_no: data.record.roll_no,
                    name: data.record.name ? data.record.name.trim() : "N/A",
                    department: data.record.department || "Unknown",
                    date: new Date(data.record.date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                    status: data.record.status,
                });
                lastScanTimeRef.current = Date.now(); // Update last scan time
                setHardwareStatus("Scanner Active"); // Assume scanner is connected if data is received
            }

            showNotification(data.message, "success");
            setManualRollNo("");
            inputRef.current?.focus();
        } catch (error) {
            console.error("Error:", error);
            showNotification("Server Error. Please try again.", "error");
        }
    };

    const handleManualEntry = async () => {
        if (!manualRollNo) {
            showNotification("Please enter a Roll Number!", "warning");
            return;
        }
        await fetchAttendance(manualRollNo);
    };

    // Handle barcode scanner input
    useEffect(() => {
        const handleScan = (event) => {
            if (event.key === "Enter" && manualRollNo) {
                fetchAttendance(manualRollNo);
                // Reset manualRollNo after Enter to prepare for next scan
                setManualRollNo("");
            } else if (event.key.length === 1 || event.key === "Enter") {
                // Accumulate keystrokes from scanner
                setManualRollNo((prev) => prev + event.key);
            }
        };

        document.addEventListener("keydown", handleScan);
        return () => document.removeEventListener("keydown", handleScan);
    }, [manualRollNo]);

    // Periodically check scanner activity
    useEffect(() => {
        const checkScannerActivity = () => {
            const timeSinceLastScan = (Date.now() - lastScanTimeRef.current) / 1000; // In seconds
            if (timeSinceLastScan > 10 && lastScanTimeRef.current > 0) {
                setHardwareStatus("Scanner Inactive (No recent scans)");
            } else if (lastScanTimeRef.current === 0 && hardwareStatus !== "Checking Scanner...") {
                setHardwareStatus("Waiting for first scan...");
            }
        };

        const interval = setInterval(checkScannerActivity, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [hardwareStatus]);

    return (
        <div className="min-h-screen bg-gray-100 relative">
            {notification.message && (
                <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white 
                    ${notification.type === "success" ? "bg-green-500" 
                    : notification.type === "error" ? "bg-red-500" 
                    : notification.type === "info" ? "bg-blue-500" 
                    : "bg-yellow-500"}`}>
                    {notification.message}
                </div>
            )}

            <div className="bg-purple-700 text-white flex justify-between items-center px-6 py-3">
                <a href="https://solamalaice.ac.in/" target="_blank" rel="noopener noreferrer"
                    className="text-2xl font-bold flex-grow text-left">
                    Solamalai College of Engineering
                </a>
                <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold">
                        {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                    </span>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center mt-10">
                <h2 className="text-2xl font-bold">Good Morning</h2>

                <div className="bg-white shadow-lg rounded-lg p-6 mt-6 w-96">
                    <div className={`text-lg font-bold mb-3 text-center 
                        ${hardwareStatus === "Scanner Active" ? "text-green-500" 
                        : hardwareStatus.includes("Inactive") || hardwareStatus.includes("Failed") ? "text-red-500" 
                        : "text-yellow-500"}`}>
                        {hardwareStatus}
                    </div>

                    <h3 className="text-xl font-bold">ID Scanner</h3>
                    <p className="text-gray-600">Show your ID Card to the scanner below or manually enter your Roll Number.</p>

                    <div className="mt-4">
                        <p className="text-lg font-bold">Manual Entry:</p>
                        <input
                            type="text"
                            placeholder="Enter Roll Number"
                            value={manualRollNo}
                            onChange={(e) => setManualRollNo(e.target.value)}
                            ref={inputRef}
                            className="border px-4 py-2 rounded w-full mt-2"
                        />
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mt-2 w-full"
                            onClick={handleManualEntry}
                        >
                            Submit
                        </button>
                    </div>

                    <div className="mt-4 border-t pt-4">
                        <p className="text-lg font-bold">Scanned Details:</p>
                        {scannedData ? (
                            <>
                                <p><strong>Roll Number:</strong> {scannedData.roll_no}</p>
                                <p><strong>Name:</strong> {scannedData.name}</p>
                                <p><strong>Department:</strong> {scannedData.department}</p>
                                <p><strong>Time:</strong> {scannedData.date}</p>
                            </>
                        ) : (
                            <p className="text-gray-500 mt-4">No data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;
