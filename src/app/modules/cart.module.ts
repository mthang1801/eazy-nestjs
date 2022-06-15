import { Module } from '@nestjs/common';
import { CartController } from '../controllers/fe/v1/cart.controller';
import { CartRepository } from '../repositories/cart.repository';
import { CartItemRepository } from '../repositories/cartItem.repository';
import { ProductsRepository } from '../repositories/products.repository';
import { CartService } from '../services/cart.service';
import { UsersModule } from './users.module';
import { ProductVariationGroupProductsRepository } from '../repositories/productVariationGroupProducts.entity';
import { ProductVariationGroupsRepository } from '../repositories/productVariationGroups.repository';
@Module({
  imports: [UsersModule],
  providers: [
    CartService,
    CartRepository,
    CartItemRepository,
    ProductsRepository,
    ProductVariationGroupProductsRepository,
    ProductVariationGroupsRepository,
  ],
  exports: [CartService, CartRepository, CartItemRepository],
  controllers: [CartController],
})
export class CartModule {}
