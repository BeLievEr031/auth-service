import { Repository } from "typeorm";
import { User } from "../entity/User";
import { IUser } from "../types";
import createHttpError from "http-errors";
export class UserService {
    constructor(private repository: Repository<User>) {}
    async create(user: IUser) {
        try {
            return await this.repository.save(user);
        } catch (err) {
            const error = createHttpError(500, "Failed to store User.");
            throw error;
        }
    }
}
