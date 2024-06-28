import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";

export class AuthController {
    // Dependency injection
    constructor(
        private userService: UserService,
        private logger: Logger
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { firstName, lastName, email, password } = req.body;
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info("User registered successfully", { id: user.id });
            res.status(201).json({ user });
        } catch (error) {
            return next(error);
        }
    }
}
