import { Module } from '@nestjs/common';
import { BannerController } from '../controllers/be/banner.controller';
import { BannerService } from '../services/banner.service';
import { BannerRepository } from '../repositories/banner.repository';
import { BannerDescriptionsRepository } from '../repositories/bannerDescription.respository';
import { ImageModule } from './image.module';
@Module({
  controllers: [BannerController],
  providers: [
    BannerService,
    BannerRepository,
    BannerDescriptionsRepository,
    String,
  ],
  exports: [BannerService],
  imports: [ImageModule],
})
export class BannerModule {}
