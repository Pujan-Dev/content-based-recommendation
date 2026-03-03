import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import type { Express } from "express"
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "Backend API documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
 apis: ["./src/Routing/*.ts"]
}

const specs = swaggerJsdoc(options)

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
}