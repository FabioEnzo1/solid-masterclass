import { buildApp } from "./drivers/app";

const app = buildApp();

await app.ready();

await app.listen({
  port: 4949,
});

console.log(`Documentation running at http://localhost:4949/docs`);
