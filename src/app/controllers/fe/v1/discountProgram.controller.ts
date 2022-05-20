import { BaseController } from '../../../../base/base.controllers';
import { Controller, Get, Res } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { Response } from 'express';
import { DiscountProgramService } from '../../../services/discountProgram.service';
@Controller('fe/v1/discount-programs')
export class DiscountProgramController extends BaseController {
  constructor(private service: DiscountProgramService) {
    super();
  }
  @Get()
  async get(@Res() res: Response): Promise<IResponse> {
    // const result = await this.service.get();
    return this.responseSuccess(res);
  }
}
