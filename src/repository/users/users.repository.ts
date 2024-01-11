import { User } from "../../models/user.model";

export interface UsersRepository {
  getUser(id: Number): Promise<User>;
}