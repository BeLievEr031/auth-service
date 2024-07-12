// jest.setup.ts
import { DataSource } from "typeorm";
import { AppDataSource } from "../config/data-source";
import createJWKSMOCK from "mock-jwks";

export let connection: DataSource;
export let jwks: ReturnType<typeof createJWKSMOCK>;

beforeAll(async () => {
    jwks = createJWKSMOCK("http://localhost:5001");
    connection = await AppDataSource.initialize();
    console.log("DB Connected");
});

beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
});

afterEach(() => {
    jwks.stop();
});

afterAll(async () => {
    await connection.destroy();
});
