import { Injectable } from '@nestjs/common';
import { PromotionAccessoryEntity } from '../entities/promotionAccessory.entity';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { ProductPromotionAccessoryRepository } from '../repositories/productPromotionAccessory.repository';
import { ProductPromotionAccessoryEntity } from '../entities/productPromotionAccessory.entity';
import { CreatePromotionAccessoryDto } from '../dto/promotionAccessories/create-promotionAccessory.dto';

@Injectable()
export class PromotionAccessoryService {
  constructor(
    private promoAccessoryRepo: PromotionAccessoryRepository<PromotionAccessoryEntity>,
    private productPromoAccessoryRepo: ProductPromotionAccessoryRepository<ProductPromotionAccessoryEntity>,
  ) {}

  async create(data: CreatePromotionAccessoryDto) {}
}
