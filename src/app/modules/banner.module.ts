import { Module } from '@nestjs/common';
import { bannerController } from '../controllers/be/banner.controller';
import { bannerService } from '../services/banner.service';
import { BannerRepository } from '../repositories/banner.repository';
import { BannerDescriptionsRepository } from '../repositories/bannerDescription.respository';
import { ImageModule } from './image.module';
@Module({
  controllers: [bannerController],
  providers: [
    bannerService,
    BannerRepository,
    BannerDescriptionsRepository,
    String,
  ],
  exports: [bannerService],
  imports: [ImageModule],
})
export class BannerModule {}
