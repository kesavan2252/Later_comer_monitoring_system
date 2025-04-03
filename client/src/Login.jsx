import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import icon from "/img/main.jpg";
import user from "/img/user.jpg";
import pwd from "/img/pwd.jpg";
import image from "/img/image.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        
         // ✅ Store the token in localStorage
         localStorage.setItem("token", data.token);  
         console.log("Token stored:", data.token); // Debugging
 
         
        if (username === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/scanner");
        }
      } else {
        toast.error("Invalid credentials!", { position: "top-right" }); // Show error notification
      }
    
    } catch (error) {
      toast.error("An error occurred. Please try again later.", { position: "top-right" }); // Show error notification
    }
  }; // Add missing closing brace here

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-cover bg-center bg-no-repeat text-white text-center"
    style={{ backgroundImage: `url(${image})` }}>

      {/* Notification Container */}
      <ToastContainer />

      <form
        onSubmit={handleLogin}
        className="flex flex-col items-center gap-4 p-6 bg-gradient-to-b from-[#3920AC] to-[#D11FB1] rounded-lg shadow-lg w-80"
      >
        <div className="flex flex-col items-center">
          <img src={icon} alt="Login Icon" className="w-16 h-16 rounded-full" />
          <h2 className="mt-2 text-2xl font-bold">LOGIN</h2>
        </div>

        {/* Username Input */}
        <div className="relative w-full">
          <img src={user} alt="User Icon" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full pl-10 py-2 border-b-2 border-white bg-transparent text-white text-lg outline-none placeholder-white placeholder-opacity-70"
          />
        </div>

        {/* Password Input with Eye Icon */}
        <div className="relative w-full">
          <img src={pwd} alt="Password Icon" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-2 border-b-2 border-white bg-transparent text-white text-lg outline-none placeholder-white placeholder-opacity-70"
          />
          {/* Eye icon for toggling visibility */}
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white text-xl"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️‍🗨️" : "👁️"}
          </span>
        </div>

        <button
          type="submit"
          className="px-6 py-2 mt-4 bg-white text-gray-700 rounded-full hover:shadow-md bg-black-200 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
