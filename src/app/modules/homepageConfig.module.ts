import { Module } from '@nestjs/common';
import { HomepageConfigureController } from '../controllers/be/v1/homepageConfig.controller';
import { HomepageConfigModuleRepository } from '../repositories/homepageModule.repository';
import { HomepageConfigModuleItemRepository } from '../repositories/homepageModuleItem.repository';
import { HomepageConfigService } from '../services/homepageConfig.service';

@Module({
  controllers: [HomepageConfigureController],
  providers: [
    HomepageConfigModuleRepository,
    HomepageConfigModuleItemRepository,
    HomepageConfigService,
  ],
  exports: [
    HomepageConfigModuleRepository,
    HomepageConfigModuleItemRepository,
    HomepageConfigService,
  ],
})
export class HomepageConfigModule {}
