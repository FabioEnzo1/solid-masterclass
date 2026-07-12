import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { z } from "zod/v4";

import {
  EmailAlreadyRegisteredError,
  InvalidMarketingChannelError,
  PasswordsDoNotMatchError,
} from "../application/errors";
import { CreateUser } from "../application/usecases/CreateUser";
import { UserRepositoryDrizzle } from "../resources/repositories/UserRepository";
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
          phoneNumber: z.string().trim().startsWith("+55"),
          email: z.email(),
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
            name: z.string(),
            age: z.number(),
            phoneNumber: z.string(),
            email: z.string(),
            preferredMarketingChannel: z.enum([
              "email",
              "sms",
              "push",
              "whatsapp",
            ]),
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
          const createUser = new CreateUser(new UserRepositoryDrizzle());
          const output = await createUser.execute(req.body);
          return res.status(201).send(output);
        } catch (error) {
          if (error instanceof PasswordsDoNotMatchError) {
            return res.status(400).send({ error: "Passwords do not match" });
          }

          if (error instanceof EmailAlreadyRegisteredError) {
            return res.status(409).send({ error: "Email já cadastrado!" });
          }

          if (error instanceof InvalidMarketingChannelError) {
            return res
              .status(400)
              .send({ error: "Canal de marketing inválido!" });
          }

          return res.status(500).send({ error: "Erro ao criar usuário!" });
        }
      },
    });
  });

  return app;
};
