import { Module } from '@nestjs/common';
import { CartController } from '../controllers/fe/v1/cart.controller';
import { CartRepository } from '../repositories/cart.repository';
import { CartItemRepository } from '../repositories/cartItem.repository';
import { CartService } from '../services/cart.service';
import { UsersModule } from './users.module';
@Module({
  imports: [UsersModule],
  providers: [CartService, CartRepository, CartItemRepository],
  exports: [CartService, CartRepository, CartItemRepository],
  controllers: [CartController],
})
export class CartModule {}
