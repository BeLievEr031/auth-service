import { DataSource } from "typeorm";
import request from "supertest";
import createJWKSMock from "mock-jwks";
import { AppDataSource } from "../../config/data-source";
import { Roles } from "../../constants";
import app from "../../app";
import { User } from "../../entity/User";

describe("POST /users", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
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

    describe("Given all fields", () => {
        it("should persist the user in the database", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            // Register user
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password1",
                tenantId: 1,
            };

            // Add token to cookie
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it("should create a manager user", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            // Register user
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password1",
                tenantId: 1,
            };

            // Add token to cookie
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });

        it("should return 403 if non admin user tries to create a user", async () => {
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            // Register user
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password1",
                tenantId: 1,
            };

            // Add token to cookie
            const res = await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(userData);

            expect(res.statusCode).toBe(403);
        });
    });
});
