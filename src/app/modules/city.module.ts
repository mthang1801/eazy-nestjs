import { Module, Global } from '@nestjs/common';
import { CityController } from '../controllers/common/city.controller';
import { CityRepository } from '../repositories/city.repository';
import { CityService } from '../services/city.service';
@Global()
@Module({
  controllers: [CityController],
  providers: [CityService, CityRepository],
  exports: [CityService, CityRepository],
})
export class CityModule {}
