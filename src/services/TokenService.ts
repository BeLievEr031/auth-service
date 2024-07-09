import fs from "node:fs";
import { sign, JwtPayload } from "jsonwebtoken";
import path from "node:path";
import createHttpError from "http-errors";
import Config from "../config";

export class TokenService {
    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;

        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private_key.pem")
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
}
