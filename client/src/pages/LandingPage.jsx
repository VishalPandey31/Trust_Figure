import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white">

      {/* Logo */}
      <h1 className="text-5xl font-bold mb-4">
        Trust Figure
      </h1>

      {/* Tagline */}
      <p className="text-gray-300 mb-8 text-center">
        A private space where only trust matters.
      </p>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-[#6c63ff] rounded-xl hover:scale-105 transition"
        >
          Login
        </button>
      </div>

    </div>
  );
}

export default LandingPage;