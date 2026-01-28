import { UserModel } from "./user.model";

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    licenseNumber: string;
    dateOfBirth: string;
}

export interface AuthResponse {
    user: UserModel;
    token: string;
    refreshToken: string;
    expiresIn: number;
}

export interface TokenPayload {
    UserId: string;
    email: string;
    role: string;
    exp: number;
}