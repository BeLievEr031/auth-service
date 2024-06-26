import request from "supertest";
import app from "../../app";
describe("POST /auth/register", () => {
    it("should return 201 and a new user", async () => {
        // AAA
        // ARRANGE
        const userData = {
            name: "John Doe",
            email: "john@example.com",
            pasword: "12356",
        };
        // ACT
        const response = await request(app)
            .post("/auth/register")
            .send(userData);
        // ASSERT
        expect(response.statusCode).toBe(201);
    });

    it("should return valid json", async () => {
        const response = await request(app).post("/auth/register");
        expect(
            (response.headers as Record<string, string>)["content-type"]
        ).toEqual(expect.stringContaining("json"));
    });
});
