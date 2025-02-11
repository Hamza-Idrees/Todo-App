const redis = require("redis");
require("dotenv").config();

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || "6379";

const client = redis.createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`
});

client.on("connect", () => {
  console.log("Redis Connected");
});

client.on("error", (err) => {
  console.log("Redis error: ", err);
});

client.connect();

module.exports = client;
