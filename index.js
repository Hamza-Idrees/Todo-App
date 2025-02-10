const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRouter = require("./route/userRoute");
const todoRouter = require("./route/todoRoute");
// swagger configuration
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/todo_db";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use("/api", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/", userRouter);
app.use("/", todoRouter);

const port = process.env.PORT;

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);

module.exports = app;
