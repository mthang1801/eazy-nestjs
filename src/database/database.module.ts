import { Module, OnApplicationShutdown, Logger, Global } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DatabaseService } from './database.service';
import {
  DatabaseMagentoPoolFactory,
  DatabasePoolFactory,
} from './database.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from 'mysql2/promise';
import { UserRepository } from '../app/repositories/user.repository';
import { ConfigService } from '@nestjs/config';
import { DatabasePool } from './enums/databasePool.enum';

@Global()
@Module({
  providers: [
    {
      provide: DatabasePool.WRITE_POOL,
      useFactory: async (configService: ConfigService) =>
        DatabasePoolFactory(configService, 'write'),
      inject: [ConfigService],
    },
    {
      provide: DatabasePool.READ_POOL,
      useFactory: async (configService: ConfigService) =>
        DatabasePoolFactory(configService, 'read'),
      inject: [ConfigService],
    },
    {
      provide: DatabasePool.MAGENTO_POOL,
      useFactory: async () => DatabaseMagentoPoolFactory(),
      inject: [ConfigService],
    },
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseModule.name);
  constructor(private readonly moduleRef: ModuleRef) {}

  onApplicationShutdown(signal?: string): any {
    this.logger.log(`Shutting down on signal ${signal}`);
    const readPool = this.moduleRef.get(DatabasePool.READ_POOL) as Pool;
    const writePool = this.moduleRef.get(DatabasePool.WRITE_POOL) as Pool;
    if (readPool) {
      readPool.end();
    }
    if (writePool) {
      writePool.end();
    }
  }
}
