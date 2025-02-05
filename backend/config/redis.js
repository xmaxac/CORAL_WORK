import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

redisClient.on('error', (e) => console.log('Redis Client Error', e));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.connect();

export default redisClient;