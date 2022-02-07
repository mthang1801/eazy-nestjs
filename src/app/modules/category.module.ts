import { Module } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CategoryController } from '../controllers/be/category.controller';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryDescriptionRepository } from '../repositories/category_descriptions.repository';
import { CategoryVendorProductCountRepository } from '../repositories/category_vendor_product_count.repository';

@Module({
  providers: [
    CategoryService,
    CategoryDescriptionRepository,
    CategoryRepository,
    CategoryVendorProductCountRepository,
  ],
  controllers: [CategoryController],
})
export class CategoryModule {}
