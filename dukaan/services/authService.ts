import axios, { AxiosResponse } from 'axios';

// Define types for user data
interface UserData {
  name: string;
  email: string;
  password: string;
  roomNo: string;
  phoneNo: number;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.114.109:5000',
  headers: { 'Content-Type': 'application/json' }
});

// Register user function
export const registerUser = async (userData: UserData): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await axiosInstance.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      roomNo: userData.roomNo,
      phoneNo: userData.phoneNo,
      password: userData.password
    });
    
    // Store the JWT token in an HttpOnly cookie
    if (response.data.token) {
      document.cookie = `token=${response.data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
    }
    
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login user function
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await axiosInstance.post('/auth/login', {
      email,
      password
    });
    
    // Store the JWT token
    if (response.data.token) {
      document.cookie = `token=${response.data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
    }
    
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Login failed' };
  }
};


export const logoutUser = (): void => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
