export default (): Record<string, any> => ({
  databaseConnection: process.env.DATABASE_CONNECTION,
  databaseHostWrite: process.env.DATABASE_HOST_WRITE,
  databaseHostRead: process.env.DATABASE_HOST_READ,
  databasePort: parseInt(process.env.DATABASE_PORT, 10),
  databaseUsername: process.env.DATABASE_USERNAME,
  databasePassword: process.env.DATABASE_PASSWORD,
  databaseName: process.env.DATABASE_NAME,
  charset: 'utf8mb4_0900_ai_ci',
});
