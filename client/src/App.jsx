import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import VoiceCall from "./components/call/VoiceCall";
import VideoCall from "./components/call/VideoCall";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";

import { useAuthStore } from "./store/useAuthStore";
import useCallStore from "./store/useCallStore";
import { useChatStore } from "./store/useChatStore";

import IncomingCall from "./components/call/IncomingCall";
import { Toaster } from "react-hot-toast";
import socket from "./socket/socket";

function App() {

  const { checkAuth, authUser } = useAuthStore();
  const initializeSocket = useCallStore((state) => state.initializeSocket);
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      socket.connect();
      initializeSocket();
      
      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });
    }

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [authUser, initializeSocket, setOnlineUsers]);

  return (
    <>
      <Toaster />

      <Routes>

        <Route
          path="/"
          element={
            !authUser
              ? <LandingPage />
              : <Navigate to="/dashboard" />
          }
        />

        <Route
          path="/register"
          element={
            !authUser || authUser.role === "admin"
              ? <RegisterPage />
              : <Navigate to="/dashboard" />
          }
        />

        <Route
          path="/login"
          element={
            !authUser
              ? <LoginPage />
              : <Navigate to="/dashboard" />
          }
        />

        <Route
          path="/dashboard"
          element={
            authUser
              ? <Dashboard />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/profile"
          element={
            authUser
              ? <ProfilePage />
              : <Navigate to="/" />
          }
        />

      </Routes>

      {/* Incoming Call Popup */}
      <IncomingCall />
      <VoiceCall />
      <VideoCall />

    </>
  );
}

export default App;