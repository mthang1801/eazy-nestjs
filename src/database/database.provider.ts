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

