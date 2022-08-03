export default (): Record<string, any> => ({
  rabbitHost: process.env.RABBIT_HOST,
  rabbitPort: +process.env.RABBIT_PORT,
  rabbitUser: process.env.RABBIT_USER,
  rabbitPass: process.env.RABBIT_PASS,
});
