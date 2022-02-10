import { Module } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductService } from '../services/products.service';
import { ProductDescriptionsRepository } from '../repositories/product_descriptions.respository';

@Module({
  providers: [
    ProductService,
    ProductsRepository,
    ProductDescriptionsRepository,
  ],
  exports: [ProductService, ProductsRepository, ProductDescriptionsRepository],
})
export class ProductsModule {}
