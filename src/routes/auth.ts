import { TokenService } from "./../services/TokenService";
import { UserService } from "./../services/UserService";
import express, { Request, Response, NextFunction } from "express";
import { AuthController } from "../controller/AuthController";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import validateEmail from "../validators/user-validator";

const authRouter = express.Router();
const repository = AppDataSource.getRepository(User);
const userService = new UserService(repository);
const tokenService = new TokenService();
const authController = new AuthController(userService, logger, tokenService);

authRouter.post(
    "/register",
    validateEmail,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next)
);

export default authRouter;
