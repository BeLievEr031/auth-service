import { Response, Request } from "express";
export class AuthController {
    async register(req: Request, res: Response) {
        res.status(201).json("POST Register");
    }
}
