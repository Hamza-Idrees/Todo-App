const swaggerJSDoc = require("swagger-jsdoc");
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Todo App",
    version: "1.0.0",
    description: "Todo App",
  },
  servers: [
    {
      url: "http://localhost:3001",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./route/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
