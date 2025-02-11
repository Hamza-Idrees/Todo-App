const redis = require("redis");
require("dotenv").config();

const REDIS_HOST = process.env.REDIS_HOST || "todo-redis";
const REDIS_PORT = process.env.REDIS_PORT || "6379";

const client = redis.createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  retry_strategy: (options) => {
    console.log(`Redis retrying connection... Attempt ${options.attempt}`);
    return Math.min(options.attempt * 100, 3000); // Retry every few seconds
  }
});

client.on("connect", () => {
  console.log("✅ Redis Connected!");
});

client.on("error", (err) => {
  console.error("❌ Redis error: ", err);
});

client.connect();

module.exports = client;
