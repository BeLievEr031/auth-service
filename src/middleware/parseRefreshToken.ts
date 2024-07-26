import { Request } from "express";
import { expressjwt } from "express-jwt";
import Config from "../config";
import { AuthToken } from "../types";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET as string,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthToken;
        return refreshToken;
    },
});
