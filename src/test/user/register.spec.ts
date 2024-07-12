import request from "supertest";
import app from "../../app";
import { User } from "../../entity/User";
import { Role } from "../../constant";
import { isJwt } from "../utils";
import { RefreshToken } from "../../entity/RefreshToken";
import { AppDataSource } from "../../config/data-source";
import { connection } from "../jest.setup";

describe.skip("POST /auth/register", () => {
    describe("with valid fields.", () => {
        it("should return 201 and a new user", async () => {
            // ARRANGE
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john1@example.com",
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
                email: "john2@example.com",
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
                email: "john3@example.com",
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

        it("should return 409. if email exist.", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john4@gmail.com",
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
            expect(response.statusCode).toBe(409);
            expect(users).toHaveLength(1);
        });

        it("should return a access and refresh token.", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john5@example.com",
                password: "12356",
                role: "customer",
            };

            interface Headers {
                "set-cookie"?: string[];
            }

            let accessToken = null;
            let refreshToken = null;

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const cookies = (response.headers as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it("should persist the refreshtoken", async () => {
            // ARRANGE
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john6@example.com",
                password: "12356",
                role: "customer",
            };

            // ACT
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const repository = connection.getRepository(RefreshToken);
            const refresh = await repository.find();

            // ASSERT
            expect(refresh).toHaveLength(1);
            const tokens = await repository
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body.user as Record<string, string>).id,
                })
                .getMany();
            // console.log("🔥🔥🔥🔥", tokens);

            expect(tokens).toHaveLength(1);
        });
    });

    describe("with field missing.", () => {
        it("should return 400. if email not given", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "",
                password: "12356",
                role: "customer",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it("should return 400. if firstname not given", async () => {
            // Arrange
            const userData = {
                firstName: "",
                lastName: "Doe",
                email: "sandy@gmail.com",
                password: "12356",
                role: "customer",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it("should return 400. if lastName not given", async () => {
            // Arrange
            const userData = {
                firstName: "sandeep",
                lastName: "",
                email: "sandy@gmail.com",
                password: "12356",
                role: "customer",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it("should return 400. if password not given", async () => {
            // Arrange
            const userData = {
                firstName: "sandeep",
                lastName: "Doe",
                email: "sandy@gmail.com",
                password: "",
                role: "customer",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it("should return 400. if Role not given", async () => {
            // Arrange
            const userData = {
                firstName: "sandeep",
                lastName: "Doe",
                email: "sandy@gmail.com",
                password: "12356",
                role: "",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it("should return 400. if Role is invalid", async () => {
            // Arrange
            const userData = {
                firstName: "sandeep",
                lastName: "Doe",
                email: "sandy@gmail.com",
                password: "12356",
                role: "SDE", //Invalid Role
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
});
