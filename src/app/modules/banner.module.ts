import { Module } from '@nestjs/common';
import { bannerController as bannerControllerBE } from '../controllers/be/v1/banner.controller';
import { bannerController as bannerControllerFE } from '../controllers/fe/v1/banner.controller';
import { bannerService } from '../services/banner.service';
import { BannerRepository } from '../repositories/banner.repository';
import { BannerDescriptionsRepository } from '../repositories/bannerDescription.respository';
import { ImageModule } from './image.module';
import { BannerLocationDescriptionRepository } from '../repositories/bannerLocationDescription.repository';
import { BannerItemRepository } from '../repositories/bannerItemDescription.repository';
import { BannerTargetDescriptionRepository } from '../repositories/bannerTargetDescription.repository';

@Module({
  controllers: [bannerControllerBE, bannerControllerFE],
  providers: [
    bannerService,
    BannerRepository,
    BannerDescriptionsRepository,
    BannerLocationDescriptionRepository,
    BannerItemRepository,
    BannerTargetDescriptionRepository,
  ],
  exports: [
    bannerService,
    BannerRepository,
    BannerDescriptionsRepository,
    BannerLocationDescriptionRepository,
    BannerItemRepository,
    BannerTargetDescriptionRepository,
  ],
  imports: [ImageModule],
})
export class BannerModule {}
