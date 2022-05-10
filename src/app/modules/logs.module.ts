import { Module, Global } from '@nestjs/common';
import { LogsController } from '../controllers/be/v1/logs.controller';
import { LogsService } from '../services/logs.service';
import { LogRepository } from '../repositories/log.repository';
import { LogModuleRepository } from '../repositories/logModule.repository';
import { LogSourceRepository } from '../repositories/logSource.repository';

@Global()
@Module({
  controllers: [LogsController],
  providers: [
    LogsService,
    LogRepository,
    LogModuleRepository,
    LogSourceRepository,
  ],
  exports: [
    LogsService,
    LogRepository,
    LogModuleRepository,
    LogSourceRepository,
  ],
})
export class LogsModule {}
