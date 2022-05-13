import { BaseController } from '../../../../base/base.controllers';
import {
  Controller,
  Res,
  Post,
  Body,
  Query,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { IResponse } from '../../../interfaces/response.interface';
import { CreateStickerDto } from 'src/app/dto/sticker/create-sticker.dto';
import { StickerService } from '../../../services/sticker.service';
import { UpdateStickerDto } from 'src/app/dto/sticker/update-sticker.dto';
import { CreateProductStickerDto } from 'src/app/dto/sticker/create-productSticker.dto';
import { UpdateProductDto } from 'src/app/dto/product/update-product.dto';
import { UpdateProductStickerDto } from 'src/app/dto/sticker/update-productSticker.dto';
import { AuthGuard } from '../../../../middlewares/be.auth';
@Controller('/be/v1/stickers')
@UseGuards(AuthGuard)
export class StickerController extends BaseController {
  constructor(private service: StickerService) {
    super();
  }
  @Post()
  async create(
    @Res() res: Response,
    @Body() data: CreateStickerDto,
  ): Promise<IResponse> {
    await this.service.create(data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get()
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Post('/products')
  async createProductSticker(
    @Res() res: Response,
    @Body() data: CreateProductStickerDto,
  ): Promise<IResponse> {
    await this.service.createProductSticker(data);
    return this.responseSuccess(res, null, 'Tạo thành công.');
  }

  @Get('/product/:product_id')
  async getProductSticker(
    @Res() res: Response,
    @Param('product_id') product_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getProductSticker(product_id);
    return this.responseSuccess(res, result);
  }

  @Get('/:sticker_id')
  async get(
    @Res() res: Response,
    @Param('sticker_id') sticker_id: number,
  ): Promise<IResponse> {
    const result = await this.service.get(sticker_id);
    return this.responseSuccess(res, result);
  }

  @Put(':sticker_id')
  async update(
    @Res() res: Response,
    @Param('sticker_id') sticker_id: number,
    @Body() data: UpdateStickerDto,
  ): Promise<IResponse> {
    await this.service.update(sticker_id, data);
    return this.responseSuccess(res, null, 'Thành công.');
  }
}
