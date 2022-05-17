import { Body, Controller, Get, Post, Res, Put, Param } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { DiscountProgramService } from '../../../services/discountProgram.service';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
@Controller('itg/v1/discount-programs')
export class DiscountProgramItgController extends BaseController {
    constructor(private service: DiscountProgramService) {
      super();
    }

    @Post()
    async createDiscountPrograms(
      @Res() res: Response,
      @Body() data,
    ): Promise<IResponse> {
      const result = await this.service.itgCreateDiscountPrograms(data);
      return this.responseSuccess(res, result);
    }
  
    @Put()
    async updateDiscountPrograms(
      @Res() res: Response,
      @Body() data,
    ): Promise<IResponse> {
      const result = await this.service.itgUpdateDiscountPrograms(data);
      return this.responseSuccess(res, result);
    }
}