import { Injectable } from '@nestjs/common';
import { CreateCartDto } from '../dto/cart/create-cart.dto';
@Injectable()
export class CartService {
  async create(data: CreateCartDto) {}
}
