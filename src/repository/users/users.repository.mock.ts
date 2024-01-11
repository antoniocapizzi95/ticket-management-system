import { User } from "src/models/user.model";
import { UsersRepository } from "./users.repository";

export class UsersRepositoryMock implements UsersRepository {
    private usersInMemory: User[];

    constructor() {
        this.usersInMemory = [{ id: 1, username: "user1" }, { id: 2, username: "user2" }, { id: 3, username: "user3" }];
    }

    async getUser(id: Number): Promise<User> {
        for (const user of this.usersInMemory) {
            if (id === user.id) {
                return user;
            }
        }
        return null;
    }
 
}