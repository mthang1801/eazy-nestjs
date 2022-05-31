import { Injectable, Logger } from '@nestjs/common';
import { LoggerService } from '../../../logger/custom.logger';

@Injectable()
export class CronService {
  private logger = new Logger(CronService.name);
}
