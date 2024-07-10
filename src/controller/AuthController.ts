import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { Role } from "../constant";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import { CredentialService } from "../services/CredentialService";
import createHttpError from "http-errors";

export class AuthController {
    // Dependency injection
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { firstName, lastName, email, password } = req.body;
            const saltRound = 10;
            const hashedPassword = await bcrypt.hash(password, saltRound);
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Role.CUSTOMER,
            });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            });
            res.status(201).json({ user });
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            const user = await this.credentialService.findByEmail(email);

            if (!user) {
                const err = createHttpError(401, "Invalid email or password.");
                return next(err);
            }

            const isPass = await this.credentialService.comparePassword(
                password,
                user.password
            );

            if (!isPass) {
                const err = createHttpError(401, "Invalid email or password.");
                return next(err);
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            });
            res.status(200).json({ user });
        } catch (error) {
            return next(error);
        }
    }
}
