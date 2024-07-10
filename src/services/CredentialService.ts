import bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User } from "../entity/User";

export class CredentialService {
    constructor(private userRepository: Repository<User>) {}

    async findByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } });
    }

    async comparePassword(password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword);
    }
}
