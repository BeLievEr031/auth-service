import { config } from "dotenv";
import path from "node:path";
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
    PORT,
    DB_TYPE,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE,
    NODE_ENV,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
} = process.env;

const Config = {
    PORT,
    DB_TYPE,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE,
    NODE_ENV,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
} as const;

export default Config;
