/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq } from "drizzle-orm";

import { db } from "../db/client";
import { userTable } from "../db/schema";

export interface UserDAO {
  findByEmail(email: string): Promise<any>;
  create(user: any): Promise<any>;
}

export class UserDAODrizzle implements UserDAO {
  async findByEmail(email: string): Promise<any> {
    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    return existingUser;
  }

  async create(user: any): Promise<any> {
    const [existingUser] = await db.insert(userTable).values(user).returning();
    return existingUser;
  }
}
