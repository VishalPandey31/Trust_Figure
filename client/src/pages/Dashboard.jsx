import Sidebar from "../components/layout/Sidebar";
import ChatContainer from "../components/chat/ChatContainer";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router-dom";
import { UserPlus, Settings, LogOut } from "lucide-react";

function Dashboard() {
  const { authUser, logout } = useAuthStore();
  const { selectedUser } = useChatStore();
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-white animate-fade-in">

      {/* TOP BAR */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
        <h1 className="font-bold text-lg md:text-xl truncate max-w-[150px] md:max-w-none">
          Trust Figure {authUser?.role === "admin" && "(Admin)"}
        </h1>

        <div className="flex items-center gap-2 md:gap-4">
          <input
            placeholder="Search user..."
            className="bg-white/5 px-2 md:px-3 py-1 rounded w-24 md:w-auto text-sm"
          />

          {authUser?.role === "admin" && (
            <button
              onClick={() => navigate("/register")}
              className="bg-[#6c63ff] p-2 md:px-3 md:py-1 rounded text-sm hover:bg-[#5a52d5] transition flex items-center"
              title="Create User"
            >
              <UserPlus size={16} className="md:mr-2" />
              <span className="hidden md:inline">Create User</span>
            </button>
          )}

          <button
            onClick={() => navigate("/profile")}
            className="bg-white/10 p-2 md:px-3 md:py-1 rounded text-sm hover:bg-white/20 transition flex items-center"
            title="Profile Settings"
          >
            <Settings size={16} className="md:mr-2" />
            <span className="hidden md:inline">Profile Settings</span>
          </button>

          <button
            onClick={logout}
            className="bg-red-500/80 p-2 md:px-3 md:py-1 rounded text-sm hover:bg-red-600 transition flex items-center"
            title="Logout"
          >
            <LogOut size={16} className="md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className={`${selectedUser ? 'hidden md:block' : 'w-full'} md:w-1/3 lg:w-1/4 border-r border-white/10 overflow-y-auto`}>
          <Sidebar />
        </div>

        {/* CHAT AREA */}
        <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden`}>
          <ChatContainer />
        </div>
      </div>

    </div>
  );
}

export default Dashboard;