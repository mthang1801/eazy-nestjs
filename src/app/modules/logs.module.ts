import { Module, Global } from '@nestjs/common';
import { LogsController } from '../controllers/be/v1/logs.controller';
import { LogsService } from '../services/logs.service';
import { LogRepository } from '../repositories/log.repository';

@Global()
@Module({
  controllers: [LogsController],
  providers: [LogsService, LogRepository],
  exports: [LogsService, LogRepository],
})
export class LogsModule {}
