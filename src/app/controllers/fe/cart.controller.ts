import { Controller, Post, Res } from '@nestjs/common';
import { BaseController } from 'src/base/base.controllers';
import { Response } from 'express';
import { CreateCartDto } from 'src/app/dto/cart/create-cart.dto';
import { CartService } from 'src/app/services/cart.service';
import { IResponse } from 'src/app/interfaces/response.interface';
@Controller('/fe/v1/carts')
export class CartController extends BaseController {
  constructor(private service: CartService) {
    super();
  }

  @Post()
  async create(@Res() res: Response, data: CreateCartDto): Promise<IResponse> {
    const result = await this.service.create(data);
    return this.responseSuccess(res, result);
  }
}
