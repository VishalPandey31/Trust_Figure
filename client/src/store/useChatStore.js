import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import socket from "../socket/socket";
import { showNotification } from "../utils/notifications";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    onlineUsers: [],

    setOnlineUsers: (users) => set({ onlineUsers: users }),

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            console.error("Error in getUsers:", error);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            console.error("Error in getMessages:", error);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            console.error("Error in sendMessage:", error);
            toast.error(error.response?.data?.error || "Failed to send message");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        socket.on("newMessage", (newMessage) => {
            // Server only delivers this message to the correct receiver
            // Just append it directly to the chat
            set({
                messages: [...get().messages, newMessage],
            });
        });
    },

    unsubscribeFromMessages: () => {
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
        if (selectedUser) {
            get().getMessages(selectedUser._id);
        } else {
            set({ messages: [] });
        }
    },
}));
