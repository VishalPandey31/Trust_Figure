import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import socket from "../socket/socket";

export const useAuthStore = create((set) => ({

    authUser: null,

    isLoading: false,

    checkAuth: async () => {

        set({
            isLoading: true,
        });

        try {

            const res =
                await axiosInstance.get("/auth/me");

            set({
                authUser: res.data.user,
            });

            if (res.data.user) {
                const userId = res.data.user._id?.toString() || res.data.user.id?.toString();
                socket.io.opts.query = { userId };

                if (!socket.connected) {
                    socket.connect();
                } else {
                    // Already connected - re-register userId
                    socket.emit("register", { userId });
                }
            }

        } catch (err) {

            set({
                authUser: null,
            });

        } finally {

            set({
                isLoading: false,
            });

        }

    },

    register: async (data) => {

        return await axiosInstance.post(
            "/auth/register",
            data
        );

    },

    login: async (data) => {

        const res =
            await axiosInstance.post(
                "/auth/login",
                data
            );

        set({
            authUser: res.data.user,
        });

        const userId = res.data.user._id?.toString() || res.data.user.id?.toString();
        socket.io.opts.query = { userId };

        if (!socket.connected) {
            socket.connect();
        } else {
            socket.emit("register", { userId });
        }

        return res.data;

    },

    logout: async () => {

        await axiosInstance.post(
            "/auth/logout"
        );

        socket.disconnect();

        set({
            authUser: null,
        });

    },

    updateAvatar: async (formData) => {
        const res = await axiosInstance.put("/users/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        set({ authUser: res.data.user });
    },

    updatePassword: async (data) => {
        await axiosInstance.put("/users/password", data);
    },

    updateVaultPin: async (data) => {
        await axiosInstance.put("/users/vault-pin", data);
    },

    deleteAccount: async () => {
        await axiosInstance.delete("/users/account");
        socket.disconnect();
        set({ authUser: null });
    },

}));