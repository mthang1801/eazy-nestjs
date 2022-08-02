export default (): Record<string, any> => ({
  rabbitHost: process.env.RABBIT_HOST,
  rabbitPort: +process.env.RABBIT_PORT,
});
