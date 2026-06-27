import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://trust-figure.onrender.com/api",
    withCredentials: true,
});




