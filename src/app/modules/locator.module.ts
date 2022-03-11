import { Module, Global } from '@nestjs/common';
import { LocatorController } from '../controllers/common/locator.controller';
import { CityRepository } from '../repositories/city.repository';
import { LocatorService } from '../services/locator.service';
import { DistrictRepository } from '../repositories/district.repository';
import { WardRepository } from '../repositories/ward.repository';

@Global()
@Module({
  controllers: [LocatorController],
  providers: [
    LocatorService,
    CityRepository,
    DistrictRepository,
    WardRepository,
  ],
  exports: [LocatorService, CityRepository, DistrictRepository, WardRepository],
})
export class LocatorModule {}
