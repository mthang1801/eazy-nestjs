import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { BaseController } from 'src/base/base.controllers';
import { Response } from 'express';
import { CreateCartDto } from 'src/app/dto/cart/create-cart.dto';
import { CartService } from 'src/app/services/cart.service';
import { IResponse } from 'src/app/interfaces/response.interface';
import { UpdateCartDto } from '../../dto/cart/update-cart.dto';
@Controller('/fe/v1/carts')
export class CartController extends BaseController {
  constructor(private service: CartService) {
    super();
  }

  @Post()
  async create(
    @Res() res: Response,
    @Body() data: CreateCartDto,
  ): Promise<IResponse> {
    await this.service.create(data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Put(':user_id')
  async update(
    @Param('user_id') user_id: string,
    @Res() res: Response,
    @Body() data: UpdateCartDto,
  ): Promise<IResponse> {
    await this.service.update(user_id, data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get(':user_id')
  async get(
    @Res() res: Response,
    @Param('user_id') user_id: string,
  ): Promise<IResponse> {
    const result = await this.service.get(user_id);
    return this.responseSuccess(res, result);
  }
}
