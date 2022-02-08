import { Module } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CategoryController as CategoryControllerBE } from '../controllers/be/category.controller';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryDescriptionRepository } from '../repositories/category_descriptions.repository';
import { CategoryVendorProductCountRepository } from '../repositories/category_vendor_product_count.repository';
import { CategoryController as CategoryControllerFE } from '../controllers/fe/category.controller';

@Module({
  providers: [
    CategoryService,
    CategoryDescriptionRepository,
    CategoryRepository,
    CategoryVendorProductCountRepository,
  ],
  controllers: [CategoryControllerBE, CategoryControllerFE],
})
export class CategoryModule {}
