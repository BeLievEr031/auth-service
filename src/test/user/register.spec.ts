import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { Role } from "../../constant";

describe("POST /auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
        // await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    it("should return 201 and a new user", async () => {
        // ARRANGE
        const userData = {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "12356",
            role: "customer",
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

    it("should assign user role.", async () => {
        // Arrange
        const userData = {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "12356",
            role: "customer",
        };

        // Act
        await request(app).post("/auth/register").send(userData);

        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();

        // Assert
        expect(users[0]).toHaveProperty("role");
        expect(users[0].role).toBe(Role.CUSTOMER);
    });

    it("should have hash password", async () => {
        const userData = {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "12356",
            role: "customer",
        };

        await request(app).post("/auth/register").send(userData);

        const repository = AppDataSource.getRepository(User);
        const users = await repository.find();

        expect(users[0].password).not.toBe(userData.password);
        expect(users[0].password).toHaveLength(60);
        expect(users[0].password).toMatch(
            /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/
        );
    });

    it("should return 400. if email exist.", async () => {
        // Arrange
        const userData = {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "12356",
            role: "customer",
        };

        const userRepository = AppDataSource.getRepository(User);
        await userRepository.save(userData);

        // Act
        const response = await request(app)
            .post("/auth/register")
            .send(userData);
        const users = await userRepository.find();
        expect(response.statusCode).toBe(400);
        expect(users).toHaveLength(1);
    });
});
