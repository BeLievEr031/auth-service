import request from "supertest";
import app from "../../app";

import { isJwt } from "../utils";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
describe("POST /auth/login", () => {
    let connection: DataSource;

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
    describe("with valid fields.", () => {
        it("should return 401 for wrong email and password.", async () => {
            const userData = {
                email: "test1@test.com",
                password: "123456",
            };

            const response = await request(app)
                .post("/auth/login")
                .send(userData);
            expect(response.statusCode).toBe(401);
        });

        it("should return 200 after login.", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "test3@test.com",
                password: "12356",
                role: "customer",
            };

            // ACT
            await request(app).post("/auth/register").send(userData);

            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: userData.password });
            expect(response.statusCode).toBe(200);
        });

        it("should return accessToken & refreshToken after login.", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "test1@test.com",
                password: "12356",
                role: "customer",
            };

            let accessToken = null;
            let refreshToken = null;

            // ACT
            await request(app).post("/auth/register").send(userData);

            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: userData.password });

            interface Headers {
                "set-cookie"?: string[];
            }

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
    });

    describe("with invalid fields.", () => {
        it("should return 400. if email not given.", async () => {
            const userData = {
                email: "",
                password: "123456",
            };

            const response = await request(app)
                .post("/auth/login")
                .send(userData);
            expect(response.statusCode).toBe(400);
        });

        it("should return 400. if password not given.", async () => {
            const userData = {
                email: "test2@gmail.com",
                password: "",
            };

            const response = await request(app)
                .post("/auth/login")
                .send(userData);
            expect(response.statusCode).toBe(400);
        });
    });
});
