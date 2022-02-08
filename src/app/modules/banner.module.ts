import { Module } from '@nestjs/common';
import { BannerController } from '../controllers/be/banner.controller';
import { BannerService } from '../services/banner.service';
import { BannerRepository } from '../repositories/banner.repository';
import { BannerDescriptionsRepository } from '../repositories/banner_description.respository';
import { ImageModule } from './image.module';
import { BannerDescriptionsService } from '../services/banner_description.service';
@Module({
  controllers: [BannerController],
  providers: [BannerService,BannerRepository,BannerDescriptionsService,BannerDescriptionsRepository,String],
  exports: [BannerService,BannerDescriptionsService],
  imports :[ImageModule],

})
export class BannerModule {}