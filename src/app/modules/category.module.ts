import { Module, forwardRef } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CategoryController as CategoryControllerBE } from '../controllers/be/category.controller';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryDescriptionRepository } from '../repositories/categoryDescriptions.repository';
import { CategoryController as CategoryControllerFE } from '../controllers/fe/category.controller';
import { ProductService } from '../services/products.service';
import { ProductsModule } from './products.module';
import { CategoryController as CategoryControllerIntegration } from '../controllers/integration/category.controller';
import { CategorySyncController } from '../controllers/sync/category.controller';

@Module({
  imports: [forwardRef(() => ProductsModule)],
  providers: [
    CategoryService,
    CategoryDescriptionRepository,
    CategoryRepository,
    ProductService,
  ],
  exports: [CategoryService, CategoryDescriptionRepository, CategoryRepository],
  controllers: [
    CategoryControllerBE,
    CategoryControllerFE,
    CategoryControllerIntegration,
    CategorySyncController,
  ],
})
export class CategoryModule {}
