import Fastify from 'fastify'

const fastify = Fastify();

// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ hello: "world" });
});

fastify.post("/users", (request, reply) => {
    reply.send({ hello: "world" });
})

await fastify.listen({ port: 3000 });

console.log("Server is running on port http://localhost:3000");