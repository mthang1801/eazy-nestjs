import { Module, Global } from '@nestjs/common';
import {
  ImagesRepository,
} from '../repositories/image.repository';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesService } from '../services/image.service';
@Global()
@Module({
  providers: [
    ImagesService,
    ImagesRepository,
    ImagesLinksRepository,
  ],
  exports: [
    ImagesService,
    ImagesRepository,
    ImagesLinksRepository,
  ],
})
export class ImageModule {}
