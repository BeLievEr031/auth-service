import { Request } from "express";
import { expressjwt } from "express-jwt";
import Config from "../config";
import { AuthToken, IRefreshTokenPayload } from "../types";
import logger from "../config/logger";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
// import

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET as string,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthToken;
        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: { id: Number(token?.payload.sub) },
                },
            });

            return refreshToken === null;
        } catch (error) {
            logger.error("Error while getting refresh Token", {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
            throw error;
        }
    },
});
