import { Module } from '@nestjs/common';
import { CartController } from '../controllers/fe/cart.controller';
import { CartItemEntity } from '../entities/cartItem.entity';
import { CartRepository } from '../repositories/cart.repository';
import { CartService } from '../services/cart.service';
import { UsersModule } from './users.module';
@Module({
  imports: [UsersModule],
  providers: [CartService, CartRepository, CartItemEntity],
  exports: [CartService, CartRepository, CartItemEntity],
  controllers: [CartController],
})
export class CartModule {}
