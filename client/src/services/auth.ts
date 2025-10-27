import axiosInstance from "@/utils/axiosInstance";
import type { AuthFormData, AuthResponse } from "@/types/auth";
import { userAPIs } from "@/api/user";

export const authHandler = async(formData:AuthFormData, isSignup:boolean):Promise<AuthResponse> => {
    try {
        const endpoint = isSignup ? userAPIs.signup : userAPIs.login;
        const response = await axiosInstance.post(endpoint, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
}