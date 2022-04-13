import { Module, Global } from '@nestjs/common';
import { WardController } from '../controllers/common/ward.controller';
import { WardService } from '../services/ward.service';
import { WardRepository } from '../repositories/ward.repository';

@Global()
@Module({
  controllers: [WardController],
  providers: [WardService, WardRepository],
  exports: [WardService, WardRepository],
})
export class WardModule {}
