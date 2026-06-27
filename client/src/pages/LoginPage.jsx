import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

function LoginPage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      await axiosInstance.post("/auth/login", form);

      await checkAuth();

      toast.success("Login Successful");
      navigate("/dashboard");

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login Failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0f] text-white">

      <div className="w-[350px] p-6 bg-white/5 backdrop-blur rounded-xl">

        <h2 className="text-2xl mb-4">Login</h2>

        <input
          name="usernameOrEmail"
          placeholder="Username or Email"
          onChange={handleChange}
          className="w-full mb-2 p-2 bg-black/30"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-4 p-2 bg-black/30"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-[#00d4ff] text-black p-2 rounded"
        >
          Login
        </button>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-400">Need to setup Admin? </span>
          <button onClick={() => navigate("/register")} className="text-[#00d4ff] hover:underline bg-transparent border-0 cursor-pointer">
            Register Admin
          </button>
        </div>

      </div>

    </div>
  );
}

export default LoginPage;