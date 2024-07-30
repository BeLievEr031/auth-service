import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import request from "supertest";
import app from "../../app";

describe("POST tenant/", () => {
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

    describe("All fields given.", () => {
        it("should return 201 on tenant creation", async () => {
            const tenantData = {
                name: "tenant1",
                address: "U.K.",
            };
            const res = await request(app).post("/tenant").send(tenantData);
            expect(res.statusCode).toBe(201);
        });

        it("should return body of tenant", async () => {
            const tenantData = {
                name: "tenant1",
                address: "U.K.",
            };
            const res = await request(app).post("/tenant").send(tenantData);
            expect(res.body).toHaveProperty("id");
        });
    });

    // describe("Fields are not given.", () => {
    //     it("should return 400 on tenant creation", async () => { })
    // })
});
