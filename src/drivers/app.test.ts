import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "../resources/db/client";
import { userTable } from "../resources/db/schema";
import { buildApp } from "./app";

const validBody = {
  name: "John Doe",
  age: 20,
  phoneNumber: "+5511999999999",
  email: "john@example.com",
  password: "password123",
  passwordConfirmation: "password123",
  preferredMarketingChannel: "email" as const,
};

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
}, 30000);

beforeEach(async () => {
  await db.delete(userTable);
});

const post = (body: unknown) =>
  request(app.server)
    .post("/users")
    .send(body as object);

const findByEmail = async (email: string) => {
  const [row] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));
  return row;
};

describe("POST /users — success", () => {
  it("creates a user and returns 201 with the public fields (no password)", async () => {
    const res = await post(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: validBody.name,
      email: validBody.email,
      age: validBody.age,
      phoneNumber: validBody.phoneNumber,
      preferredMarketingChannel: validBody.preferredMarketingChannel,
    });
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body).not.toHaveProperty("password");
  });

  it("persists the user in the database", async () => {
    await post(validBody);

    const row = await findByEmail(validBody.email);
    expect(row).toBeDefined();
    expect(row).toMatchObject({
      name: validBody.name,
      email: validBody.email,
      age: validBody.age,
      phoneNumber: validBody.phoneNumber,
      preferredMarketingChannel: validBody.preferredMarketingChannel,
    });
  });

  it("stores the password hashed, not in plain text", async () => {
    await post(validBody);

    const row = await findByEmail(validBody.email);
    expect(row.password).not.toBe(validBody.password);
    await expect(
      bcrypt.compare(validBody.password, row.password),
    ).resolves.toBe(true);
  });

  it.each(["email", "sms", "push", "whatsapp"] as const)(
    "creates a user with the %s marketing channel",
    async (channel) => {
      const res = await post({
        ...validBody,
        preferredMarketingChannel: channel,
      });

      expect(res.status).toBe(201);
      expect(res.body.preferredMarketingChannel).toBe(channel);

      const row = await findByEmail(validBody.email);
      expect(row.preferredMarketingChannel).toBe(channel);
    },
  );
});

describe("POST /users — 400 password mismatch", () => {
  it("returns 400 when password !== passwordConfirmation", async () => {
    const res = await post({
      ...validBody,
      passwordConfirmation: "different123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Passwords do not match" });
  });

  it("does not persist anything when passwords mismatch", async () => {
    await post({ ...validBody, passwordConfirmation: "different123" });

    expect(await findByEmail(validBody.email)).toBeUndefined();
  });
});

describe("POST /users — 409 e-mail already registered", () => {
  it("returns 409 when the e-mail already exists", async () => {
    const first = await post(validBody);
    expect(first.status).toBe(201);

    const res = await post({
      ...validBody,
      phoneNumber: "+5511888888888",
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "Email já cadastrado!" });
  });

  it("keeps only the original user (no duplicate inserted)", async () => {
    await post(validBody);
    await post({ ...validBody, phoneNumber: "+5511888888888" });

    const rows = await db.select().from(userTable);
    expect(rows).toHaveLength(1);
  });
});

describe("POST /users — 500 internal error", () => {
  it("returns 500 when a DB constraint throws (duplicate phone, new e-mail)", async () => {
    const first = await post(validBody);
    expect(first.status).toBe(201);

    const res = await post({
      ...validBody,
      email: "jane@example.com",
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Erro ao criar usuário!" });
  });
});

describe("POST /users — 400 schema validation", () => {
  const cases: Array<[string, Record<string, unknown>]> = [
    ["name missing", omit(validBody, "name")],
    ["name empty", { ...validBody, name: "   " }],
    ["age below 12", { ...validBody, age: 11 }],
    ["age not a number", { ...validBody, age: "20" }],
    [
      "phoneNumber missing the +55 prefix",
      { ...validBody, phoneNumber: "11999999999" },
    ],
    ["phoneNumber empty", { ...validBody, phoneNumber: "" }],
    ["email invalid", { ...validBody, email: "not-an-email" }],
    ["email missing", omit(validBody, "email")],
    [
      "password shorter than 8",
      { ...validBody, password: "short", passwordConfirmation: "short" },
    ],
    [
      "passwordConfirmation shorter than 8",
      { ...validBody, passwordConfirmation: "short" },
    ],
    [
      "preferredMarketingChannel invalid",
      { ...validBody, preferredMarketingChannel: "carrier-pigeon" },
    ],
    [
      "preferredMarketingChannel missing",
      omit(validBody, "preferredMarketingChannel"),
    ],
    ["empty body", {}],
  ];

  it.each(cases)("returns 400 when %s", async (_label, body) => {
    const res = await post(body);

    expect(res.status).toBe(400);
    const rows = await db.select().from(userTable);
    expect(rows).toHaveLength(0);
  });
});

function omit<T extends Record<string, unknown>>(obj: T, key: keyof T) {
  const clone = { ...obj };
  delete clone[key];
  return clone;
}
