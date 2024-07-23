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

export interface IAuth extends Request {
    auth: {
        sub: number;
        role: string;
    };
}
