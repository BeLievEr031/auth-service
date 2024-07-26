import { Request } from "express";
export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
}

export interface RegisterUserRequest extends Request {
    body: IUser;
}

export interface AuthRequest extends Request {
    auth: {
        sub: number;
        role: string;
        id?: number;
    };
}

export interface AuthToken {
    accessToken: string;
    refreshToken: string;
}

export interface IRefreshTokenPayload {
    id: string;
}
