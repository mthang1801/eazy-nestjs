import { forwardRef, Module } from '@nestjs/common';
import { StickerController } from '../controllers/be/sticker.controller';
import { ProductStickerRepository } from '../repositories/productSticker.repository';

import { StickerRepository } from '../repositories/sticker.repository';
import { StickerService } from '../services/sticker.service';
import { ProductsModule } from './products.module';
@Module({
  imports: [forwardRef(() => ProductsModule)],
  exports: [StickerRepository, StickerService, ProductStickerRepository],
  providers: [StickerRepository, StickerService, ProductStickerRepository],
  controllers: [StickerController],
})
export class StickerModule {}
