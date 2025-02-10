const redisClient = require("../redis/redisConnection");

redisClient.flushAll();
const saveDataInCache = async (key, value) => {
  redisClient.set(key, JSON.stringify(value));
};

const getDataFromCache = async (key) => {
  return redisClient.get(key);
};

const deleteDataFromCache = async (key) => {
  redisClient.del(key);
};

module.exports = {
  saveDataInCache,
  getDataFromCache,
  deleteDataFromCache,
};
