import fs from "node:fs";
import { sign, JwtPayload } from "jsonwebtoken";
import path from "node:path";
import createHttpError from "http-errors";
import Config from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { Repository } from "typeorm";
import { IUser } from "../types";

export class TokenService {
    constructor(private repository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;

        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pem")
            );
            const accessToken = sign(payload, privateKey, {
                algorithm: "RS256",
                expiresIn: "1h",
                issuer: "Auth-Service",
            });

            return accessToken;
        } catch (error) {
            const err = createHttpError(
                500,
                "Error while reading private key."
            );
            throw err;
        }
    }

    generateRefreshToken(payload: JwtPayload) {
        return sign(payload, Config.REFRESH_TOKEN_SECRET as string, {
            algorithm: "HS256",
            expiresIn: "1d",
            issuer: "Auth-Service",
            jwtid: String(payload.id),
        });
    }

    async persistRefreshToken(user: IUser) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const RefreshToken = await this.repository.save({
            user: user,
            expireAt: new Date(Date.now() + MS_IN_YEAR),
        });

        return RefreshToken;
    }
}
