const redis = require("redis");
require("dotenv").config();

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.on("connect", () => {
  console.log("Redis Connected");
});

client.on("error", (err) => {
  console.log("Redis error: ", err);
});

client.connect();

module.exports = client;
