import { eq } from "drizzle-orm";

import { User } from "../../application/entities/User";
import { db } from "../db/client";
import { userTable } from "../db/schema";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

export class UserRepositoryDrizzle implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    return existingUser;
  }
  async create(user: User): Promise<User> {
    const [existingUser] = await db.insert(userTable).values(user).returning();
    return existingUser;
  }
}
