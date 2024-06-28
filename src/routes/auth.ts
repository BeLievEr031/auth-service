import { UserService } from "./../services/UserService";
import express from "express";
import { AuthController } from "../controller/AuthController";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";

const authRouter = express.Router();
const repository = AppDataSource.getRepository(User);
const userService = new UserService(repository);
const authController = new AuthController(userService, logger);

authRouter.post("/register", (req, res, next) =>
    authController.register(req, res, next)
);

export default authRouter;
