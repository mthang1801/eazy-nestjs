import {
  Controller,
  Req,
  Query,
  Get,
  Res,
  Param,
  Body,
  Put,
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { DiscountProgramService } from '../../../services/discountProgram.service';
import { UpdateDiscountProgramDto } from '../../../dto/discountProgram/update-discountProgram.dto';
@Controller('be/v1/discount-programs')
export class DiscountProgramController extends BaseController {
  constructor(private service: DiscountProgramService) {
    super();
  }
  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':discount_id')
  async getById(
    @Res() res: Response,
    @Param('discount_id') discount_id: number,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getById(discount_id, params);
    return this.responseSuccess(res, result);
  }

  @Put(':discount_id')
  async update(
    @Res() res: Response,
    @Param('discount_id') discount_id: number,
    @Body() data: UpdateDiscountProgramDto,
  ) {
    await this.service.update(discount_id, data);
    return this.responseSuccess(res);
  }

  @Get(':discount_id/products')
  async getProductsInDiscountProgram(
    @Res() res: Response,
    @Param('discount_id') discount_id: number,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getProductsInDiscountProgram(
      discount_id,
      params,
    );
    return this.responseSuccess(res, result);
  }
}
