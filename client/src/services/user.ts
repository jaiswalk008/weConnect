import axiosInstance from "@/utils/axiosInstance"
import { userAPIs } from "@/api/user"

export const getMe = () =>{
    try {
        const response = axiosInstance.get(userAPIs.me)
        return response
    } catch (error) {
        throw error
    }
}

export const updateUsername = (username: string) => {
    try {
        const response = axiosInstance.patch(userAPIs.username, {username})
        return response;
    } catch (error) {
        throw error
    }
}

export const updateProfileImage = (profile_image: string) => {
    try {
        const response = axiosInstance.patch(userAPIs.profileImage, {profile_image})
        return response;
    } catch (error) {
        throw error
    }
}
