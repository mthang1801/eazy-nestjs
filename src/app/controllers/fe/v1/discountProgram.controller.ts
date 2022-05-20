import { BaseController } from '../../../../base/base.controllers';
import { Controller, Get, Res } from '@nestjs/common';
@Controller('fe/v1/discount-programs')
export class DiscountProgramController extends BaseController {
  @Get()
  async getList(@Res() res) {}
}
