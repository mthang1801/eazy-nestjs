import { Module, Global } from '@nestjs/common';
import { LogService } from './log.service';
import { ErrorLogRepository } from '../repositories/errorLog.repository';
@Global()
@Module({
  providers: [LogService, ErrorLogRepository],
  exports: [LogService, ErrorLogRepository],
})
export class LogModule {}
