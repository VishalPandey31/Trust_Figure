import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

function RegisterPage() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    vaultPin: "",
    adminSecretCode: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // validation
      if (form.password !== form.confirmPassword) {
        return toast.error("Passwords do not match");
      }

      if (form.vaultPin.length !== 6) {
        return toast.error("PIN must be 6 digits");
      }

      await axiosInstance.post("/auth/register", form);

      toast.success("Account Created Successfully");
      if (authUser) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration Failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0f] text-white">

      <div className="w-[400px] p-6 bg-white/5 backdrop-blur rounded-xl">

        <h2 className="text-2xl mb-4">{authUser ? "Create New User" : "Register Admin"}</h2>

        <input name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full mb-2 p-2 bg-black/30" />
        <input name="username" placeholder="Username" onChange={handleChange} className="w-full mb-2 p-2 bg-black/30" />
        <input name="email" placeholder="Email" onChange={handleChange} className="w-full mb-2 p-2 bg-black/30" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full mb-2 p-2 bg-black/30" />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} className="w-full mb-2 p-2 bg-black/30" />
        <input name="vaultPin" placeholder="6-digit PIN" onChange={handleChange} className="w-full mb-4 p-2 bg-black/30" />

        {!authUser && (
          <input
            name="adminSecretCode"
            type="password"
            placeholder="Admin Secret Code"
            onChange={handleChange}
            className="w-full mb-4 p-2 bg-black/30 border border-[#6c63ff]/50 rounded"
          />
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-[#6c63ff] p-2 rounded mb-2"
        >
          {authUser ? "Create User" : "Create Account"}
        </button>

        {authUser && (
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-white/10 p-2 rounded hover:bg-white/20 transition"
          >
            Cancel
          </button>
        )}

      </div>

    </div>
  );
}

export default RegisterPage;