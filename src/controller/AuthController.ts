import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { Role } from "../constant";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { TokenService } from "../services/TokenService";

export class AuthController {
    // Dependency injection
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService
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
            this.logger.info("User registered successfully", { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
            const refreshRepository = AppDataSource.getRepository(RefreshToken);

            const refresh = await refreshRepository.save({
                user: user,
                expireAt: new Date(Date.now() + MS_IN_YEAR),
            });

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: refresh.id,
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
            return next(error);
        }
    }
}
