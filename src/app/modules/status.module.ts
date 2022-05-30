import { Module } from '@nestjs/common';
import { StatusController } from '../controllers/be/v1/status.controller';
import { StatusRepository } from '../repositories/status.repository';
import { StatusDescriptionRepository } from '../repositories/statusDescription.repository';
import { StatusService } from '../services/status.service';

@Module({
  controllers: [StatusController],
  providers: [StatusService, StatusRepository, StatusDescriptionRepository],
  exports: [StatusService, StatusRepository, StatusDescriptionRepository],
})
export class StatusModule {}
