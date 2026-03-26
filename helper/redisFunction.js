const redisClient = require("../redis/redisConnection");

redisClient.flushAll();

module.exports = {

  saveDataInCache : async (key, value) => redisClient.set(key, JSON?.stringify(value)),

  getDataFromCache : async (key) => redisClient.get(key),

  deleteDataFromCache : async (key) => redisClient.del(key),
}
