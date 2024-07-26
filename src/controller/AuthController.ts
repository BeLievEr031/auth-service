import { NextFunction, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
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

    async self(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userID = req.auth.sub;
            const user = await this.userService.userDetails(userID);
            res.status(200).json({ ...user, password: undefined });
        } catch (error) {
            return next(error);
        }
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                const err = createHttpError(401, "Invalid token.");
                return next(err);
            }

            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
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

            res.status(200).json({ msg: "Token Refreshed!" });
        } catch (error) {
            return next(error);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh Token deleted.", { id: req.auth.id });
            this.logger.info("User has been logged out.", { id: req.auth.sub });
            res.clearCookie("accessToken");
            res.clearCookie("rfreshToken");
            res.status(200).json({ msg: "User logged out." });
        } catch (error) {
            return next(error);
        }
    }
}
