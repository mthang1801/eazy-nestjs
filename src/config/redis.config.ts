export default (): Record<string, any> => ({
  redisHost: process.env.REDIS_HOST,
  redisPort: parseInt(process.env.REDIS_PORT),
  redisPass: process.env.REDIS_PASS,
  redisTTL: +process.env.REDIS_TTL || 5400,
});
