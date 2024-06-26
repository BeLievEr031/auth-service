import express from "express";
import { AuthController } from "../controller/AuthController";

const authRouter = express.Router();
const authController = new AuthController();

authRouter.post("/register", (req, res) => authController.register(req, res));

export default authRouter;
