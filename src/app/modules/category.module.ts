import { Module } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CategoryController as CategoryControllerBE } from '../controllers/be/category.controller';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryDescriptionRepository } from '../repositories/categoryDescriptions.repository';
import { CategoryController as CategoryControllerFE } from '../controllers/fe/category.controller';

@Module({
  providers: [
    CategoryService,
    CategoryDescriptionRepository,
    CategoryRepository,
  ],
  controllers: [CategoryControllerBE, CategoryControllerFE],
})
export class CategoryModule {}
