import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { truncateTables } from "../utils";
describe("POST /auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    it("should return 201 and a new user", async () => {
        // AAA
        // ARRANGE
        const userData = {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "12356",
        };
        // ACT
        const response = await request(app)
            .post("/auth/register")
            .send(userData);
        // ASSERT
        expect(response.statusCode).toBe(201);

        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        expect(users).toHaveLength(1);
        expect(
            (response.headers as Record<string, string>)["content-type"]
        ).toEqual(expect.stringContaining("json"));
    });
});
