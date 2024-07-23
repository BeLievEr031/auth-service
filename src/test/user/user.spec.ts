import { DataSource } from "typeorm";
import request from "supertest";
import createJWKSMock from "mock-jwks";
import { Role } from "../../constant";
import app from "../../app";
import { AppDataSource } from "../../config/data-source";

// import { AppDataSource } from "../../src/config/data-source";
// import app from "../../src/app";
// import { Roles } from "../../src/constants";

describe("GET /auth/self", () => {
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
        it("should return the 200 status code", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john1@example.com",
                password: "12356",
                role: "customer",
            };

            // ACT
            const data = await request(app)
                .post("/auth/register")
                .send(userData);

            const accessToken = jwks.token({
                sub: data.body.user.id,
                role: Role.CUSTOMER,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
            console.log(response.body);
            const testID = data.body.user.id;
            expect(response.body.id).toBe(testID);
        });

        it("should not return password.", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john1@example.com",
                password: "12356",
                role: "customer",
            };

            // ACT
            const data = await request(app)
                .post("/auth/register")
                .send(userData);

            const accessToken = jwks.token({
                sub: data.body.user.id,
                role: Role.CUSTOMER,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            expect(response.body).not.toHaveProperty("password");
        });

        it("should return the 401 status code if no token is given", async () => {
            const response = await request(app).get("/auth/self").send();
            expect(response.statusCode).toBe(401);
        });
    });
});
