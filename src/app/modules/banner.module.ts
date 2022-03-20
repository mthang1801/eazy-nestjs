import { Module } from '@nestjs/common';
import { bannerController as bannerControllerBE } from '../controllers/be/banner.controller';
import { bannerController as bannerControllerFE } from '../controllers/fe/banner.controller';
import { bannerService } from '../services/banner.service';
import { BannerRepository } from '../repositories/banner.repository';
import { BannerDescriptionsRepository } from '../repositories/bannerDescription.respository';
import { ImageModule } from './image.module';
import { BannerLocationDescriptionRepository } from '../repositories/bannerLocationDescription.repository';
import { BannerTargetDescriptionRepository } from '../repositories/bannerTargetDescription.repository copy';
import { BannerPageDescriptionRepository } from '../repositories/bannerPageDescription.repository';
@Module({
  controllers: [bannerControllerBE, bannerControllerFE],
  providers: [
    bannerService,
    BannerRepository,
    BannerDescriptionsRepository,
    BannerLocationDescriptionRepository,
    BannerTargetDescriptionRepository,
    BannerPageDescriptionRepository,
  ],
  exports: [
    bannerService,
    BannerRepository,
    BannerDescriptionsRepository,
    BannerLocationDescriptionRepository,
    BannerTargetDescriptionRepository,
    BannerPageDescriptionRepository,
  ],
  imports: [ImageModule],
})
export class BannerModule {}
