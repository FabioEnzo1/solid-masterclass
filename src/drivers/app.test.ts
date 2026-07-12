import { FastifyInstance } from "fastify";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "../resources/db/client";
import { userTable } from "../resources/db/schema";
import { buildApp } from "./app";

let app: FastifyInstance;

beforeAll(async () => {
  app = buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await db.delete(userTable);
});

const validBody = {
  name: "John Doe",
  age: 20,
  phoneNumber: "+5511999999999",
  email: "john@example.com",
  password: "password123",
  passwordConfirmation: "password123",
  preferredMarketingChannel: "email" as const,
};

describe("POST /users", () => {
  it("should return 201 if the user is created", async () => {
    const response = await request(app.server).post("/users").send(validBody);
    expect(response.status).toBe(201);
  });
});
