import { Module, Global } from '@nestjs/common';
import { DistrictControler } from '../controllers/common/district.controller';
import { DistrictService } from '../services/district.service';
import { DistrictRepository } from '../repositories/district.repository';

@Global()
@Module({
  controllers: [DistrictControler],
  providers: [DistrictService, DistrictRepository],
  exports: [DistrictService, DistrictRepository],
})
export class DistrictModule {}
