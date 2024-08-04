import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import app from "../../app";
import { Role } from "../../constant";

describe("POST tenant/", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
        console.log("DB Connected");
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        jwks.stop();
        await connection.destroy();
    });

    describe("All fields given.", () => {
        it("should return 201 on tenant creation", async () => {
            const tenantData = {
                name: "tenant1",
                address: "U.K.",
            };
            const adminToken = jwks.token({
                sub: "1",
                role: Role.ADMIN,
            });
            const res = await request(app)
                .post("/tenant")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);
            expect(res.statusCode).toBe(201);
        });

        it("should return body of tenant", async () => {
            const tenantData = {
                name: "tenant1",
                address: "U.K.",
            };

            const adminToken = jwks.token({
                sub: "1",
                role: Role.ADMIN,
            });
            const res = await request(app)
                .post("/tenant")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(res.body).toHaveProperty("id");
            expect(res.body).toHaveProperty("name");
            expect(res.body).toHaveProperty("address");
            expect(res.body.address).toBe(tenantData.address);
            expect(res.body.name).toBe(tenantData.name);
        });

        it("should return 401 for unauthorized access", async () => {
            const tenantData = {
                name: "tenant1",
                address: "U.K.",
            };

            const res = await request(app).post("/tenant").send(tenantData);
            expect(res.statusCode).toBe(401);
        });

        it("should return 403 if user not admin", async () => {
            const tenantData = {
                name: "tenant1",
                address: "U.K.",
            };

            const managerToken = jwks.token({
                sub: "1",
                role: Role.MANAGER,
            });

            const res = await request(app)
                .post("/tenant")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(tenantData);
            expect(res.statusCode).toBe(403);
        });
    });

    // describe("Fields are not given.", () => {
    //     it("should return 400 on tenant creation", async () => { })
    // })
});
