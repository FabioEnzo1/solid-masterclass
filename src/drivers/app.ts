import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { z } from "zod/v4";

import { db } from "../resources/db/client";
import { userTable } from "../resources/db/schema";

export const buildApp = () => {
  const app = fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "SampleApi",
        description: "Sample backend service",
        version: "1.0.0",
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUI, {
    routePrefix: "/docs",
  });

  app.after(() => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/users",
      schema: {
        body: z.object({
          name: z.string().trim().min(1),
          age: z.number().int().min(18).max(100),
          phoneNumber: z.string().trim().min(1),
          email: z.string().email(),
          password: z.string().min(8),
          passwordConfirmation: z.string().min(8),
          preferredMarketingChannel: z.enum([
            "email",
            "sms",
            "push",
            "whatsapp",
          ]),
        }),
        response: {
          201: z.object({
            id: z.uuid(),
          }),
          400: z.object({
            error: z.string(),
          }),
          409: z.object({
            error: z.string(),
          }),
          500: z.object({
            error: z.string(),
          }),
        },
      },
      handler: async (req, res) => {
        try {
          if (req.body.password !== req.body.passwordConfirmation) {
            return res.status(400).send({ error: "Passwords do not match" });
          }
          const [existingUser] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, req.body.email));
          if (existingUser) {
            return res.status(409).send({ error: "Email já cadastrado!" });
          }
          const [user] = await db
            .insert(userTable)
            .values({
              name: req.body.name,
              age: req.body.age,
              phoneNumber: req.body.phoneNumber,
              email: req.body.email,
              password: await bcrypt.hash(req.body.password, 10),
              preferredMarketingChannel: req.body.preferredMarketingChannel,
            })
            .returning();
          if (!user) {
            return res.status(500).send({ error: "Erro ao criar o usuário!" });
          }
          return res.status(201).send({
            id: user.id,
          });
        } catch (error) {
          console.error(error);
          return res.status(500).send({ error: "Erro interno do servidor!" });
        }
      },
    });
  });
  return app;
};
