import { Module } from '@nestjs/common';
import { bannerController } from '../controllers/be/banner.controller';
import { bannerService } from '../services/banner.service';
import { bannerRepository } from '../repositories/banner.repository';
import { bannerDescriptionsRepository } from '../repositories/bannerDescription.respository';
import { ImageModule } from './image.module';
@Module({
  controllers: [bannerController],
  providers: [
    bannerService,
    bannerRepository,
    bannerDescriptionsRepository,
    String,
  ],
  exports: [bannerService],
  imports: [ImageModule],
})
export class BannerModule {}
