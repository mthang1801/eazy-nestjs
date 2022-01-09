import { Pool, createPool } from 'mysql2/promise';

export const DatabasePoolFactory = async () => {
  return createPool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: +process.env.DB_PORT,
  });
};
