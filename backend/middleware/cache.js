import redisClient from "../config/redis.js"

export const cacheMiddleware = (prefix, ttl = 300) => {
  return async (req, res, next) => {
    try {
      const key = `${prefix}:${req.originalUrl}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json;

      res.json = function(data) {
        res.json = originalJson;

        redisClient.setEx(key, ttl, JSON.stringify(data));
        return res.json(data);
      };
      
      next();
    } catch (e) {
      console.log('Cache Miss:', e);
      next();
    }
  };
};

export const deleteCacheByPattern = async (pattern) => {
  const keys = await redisClient.keys(pattern);
  if (keys.length) {
    await redisClient.del(keys);
  }
}