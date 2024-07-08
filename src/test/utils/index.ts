import { DataSource } from "typeorm";
import logger from "../../config/logger";

export const truncateTables = async (connection: DataSource) => {
    try {
        const entities = connection.entityMetadatas;
        for (const entity of entities) {
            const repository = connection.getRepository(entity.name);
            await repository.clear();
        }
    } catch (error) {
        logger.error(error);
    }
};

function isBase64Url(str: string): boolean {
    try {
        const base64UrlPattern = /^[A-Za-z0-9\-_]+$/;
        return base64UrlPattern.test(str);
    } catch (error) {
        return false;
    }
}

export function isJwt(token: string | null): boolean {
    if (!token) return false;

    const parts = token.split(".");
    if (parts.length !== 3) return false;

    return parts.every(isBase64Url);
}

// Example usage
const token = "your.jwt.token.here";
console.log(isJwt(token)); // Returns true or false based on the format check
