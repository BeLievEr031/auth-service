import { CredentialService } from "./../services/CredentialService";
import { TokenService } from "./../services/TokenService";
import { UserService } from "./../services/UserService";
import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import { AuthController } from "../controller/AuthController";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import validateEmail, {
    loginValidator as validateLogin,
} from "../validators/user-validator";
import { RefreshToken } from "../entity/RefreshToken";
import authenticate from "../middleware/authenticate";
import { IAuth } from "../types";

const authRouter = express.Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepo);
const credentialService = new CredentialService(userRepository);
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService
);

authRouter.post(
    "/register",
    validateEmail,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next)
);

authRouter.post(
    "/login",
    validateLogin,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next)
);

authRouter.get(
    "/self",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        authController.self(req as IAuth, res, next)
);

export default authRouter;
