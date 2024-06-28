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
