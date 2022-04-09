import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { BaseController } from 'src/base/base.controllers';
import { Response } from 'express';
import { CreateCartDto } from 'src/app/dto/cart/create-cart.dto';
import { CartService } from 'src/app/services/cart.service';
import { IResponse } from 'src/app/interfaces/response.interface';
import { AlterUserCartDto } from '../../../dto/cart/update-cart.dto';
@Controller('/fe/v1/carts')
export class CartController extends BaseController {
  constructor(private service: CartService) {
    super();
  }

  @Post(':user_id')
  async create(
    @Res() res: Response,
    @Body('product_id') product_id: number,
    @Param('user_id') user_id: number,
  ): Promise<IResponse> {
    await this.service.create(user_id, product_id);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  /**
   * Change user cart
   * @param user_id
   * @param res
   * @param data
   * @returns
   */
  @Put('/alter/:user_id')
  async alterUser(
    @Param('user_id') user_id: string,
    @Res() res: Response,
    @Body('alter_user_id') alter_user_id: number,
  ): Promise<IResponse> {
    await this.service.alterUser(user_id, alter_user_id);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Put(':cart_item_id')
  async update(
    @Param('cart_item_id') cart_item_id: string,
    @Res() res: Response,
    @Body('amount') amount: number,
  ): Promise<IResponse> {
    await this.service.update(cart_item_id, amount);
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

  @Delete(':cart_item_id')
  async delete(
    @Param('cart_item_id') cart_item_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.delete(cart_item_id);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Delete('/clear/:cart_id')
  async clearAll(
    @Res() res: Response,
    @Param('cart_id') cart_id: number,
  ): Promise<IResponse> {
    await this.service.clearAll(cart_id);
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
