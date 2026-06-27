import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useVaultStore = create((set) => ({
    isVaultOpen: false,

    verifyPin: async (pin) => {
        try {

            const res = await axiosInstance.post(
                "/vault/verify-pin",
                { pin }
            );

            if (res.data.vaultAccess) {
                set({
                    isVaultOpen: true
                });
            }

        } catch (error) {
            throw error;
        }
    },

    lockVault: () => {
        set({
            isVaultOpen: false
        });
    }
}));