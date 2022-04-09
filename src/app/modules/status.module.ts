import { Module } from '@nestjs/common';
import { StatusController } from '../controllers/be/v1/status.controller';
import { StatusRepository } from '../repositories/status.repository';
import { StatusDataRepository } from '../repositories/statusData.repository';
import { StatusDescriptionRepository } from '../repositories/statusDescription.repository';
import { StatusService } from '../services/status.service';

@Module({
  controllers: [StatusController],
  providers: [
    StatusService,
    StatusRepository,
    StatusDescriptionRepository,
    StatusDataRepository,
  ],
  exports: [
    StatusService,
    StatusRepository,
    StatusDescriptionRepository,
    StatusDataRepository,
  ],
})
export class StatusModule {}
