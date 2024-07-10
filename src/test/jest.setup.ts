// jest.setup.ts
import { DataSource } from "typeorm";
import { AppDataSource } from "../config/data-source";

export let connection: DataSource;

beforeAll(async () => {
    connection = await AppDataSource.initialize();
    console.log("DB Connected");
});

beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
});

afterAll(async () => {
    await connection.destroy();
});
