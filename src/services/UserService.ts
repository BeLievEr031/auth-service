import { Repository } from "typeorm";
import { User } from "../entity/User";
import { IUser } from "../types";
import createHttpError from "http-errors";
export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create(user: IUser) {
        const userData = await this.userRepository.findOne({
            where: { email: user.email },
        });

        if (userData) {
            const err = createHttpError(400, "email already exist.");
            throw err;
        }

        try {
            return await this.userRepository.save(user);
        } catch (err) {
            const error = createHttpError(500, "Failed to store User.");
            throw error;
        }
    }
}
