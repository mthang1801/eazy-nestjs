export default (): Record<string, any> => ({
  port: parseInt(process.env.PORT, 10),
  bcryptSalt: parseInt(process.env.BCRYPT_SALT, 10),
  apiPrefix: process.env.API_PREFIX,
  whiteListCORS: process.env.WHITE_LIST_CORS.split(','),
});
