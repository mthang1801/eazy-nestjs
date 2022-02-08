import { Module, Global } from '@nestjs/common';
import {
  ImagesLinksRepository,
  ImagesRepository,
} from '../repositories/image.repository';
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
