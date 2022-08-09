import { createPool } from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';
export const DatabasePoolFactory = async (
  configService: ConfigService,
  dbType: string = 'write',
) => {
  const databaseName = configService.get<string>('databaseName');
  const databaseHostWrite = configService.get<string>('databaseHostWrite');
  const databaseHostRead = configService.get<string>('databaseHostRead');
  const databasePort = configService.get<string>('databasePort');
  const databaseUsername = configService.get<string>('databaseUsername');
  const databasePassword = configService.get<string>('databasePassword');
  const charset = configService.get<string>('charset');
  return createPool({
    user: databaseUsername,
    host:
      dbType.toLowerCase() === 'write' ? databaseHostWrite : databaseHostRead,
    database: databaseName,
    password: databasePassword,
    port: +databasePort,
    charset,
  });
};

export const DatabaseMagentoPoolFactory = () => {
  const databaseName = 'ddv_db';
  const databaseHost = '103.138.113.76';
  const databasePort = 3306;
  const databaseUsername = 'ddv_guest';
  const databasePassword = 'KXBHcQjGfTp042T';

  return createPool({
    user: databaseUsername,
    host: databaseHost,
    database: databaseName,
    password: databasePassword,
    port: +databasePort,
  });
};
