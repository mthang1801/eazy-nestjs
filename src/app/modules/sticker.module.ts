import { Module } from '@nestjs/common';
import { StickerController } from '../controllers/be/sticker.controller';

import { StickerRepository } from '../repositories/sticker.repository';
import { StickerService } from '../services/sticker.service';
@Module({
  exports: [StickerRepository, StickerService],
  providers: [StickerRepository, StickerService],
  controllers: [StickerController],
})
export class StickerModule {}
