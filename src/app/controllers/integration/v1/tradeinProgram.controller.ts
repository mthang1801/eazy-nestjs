import { Body, Controller, Post, Res, Put, Param, Get } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { TradeinProgramService } from '../../../services/tradeinProgram.service';
import { Response } from 'express';
@Controller('itg/v1/tradein-programs')
export class TradeinProgramControllerItg extends BaseController {
  constructor(private service: TradeinProgramService) {
    super();
  }
  @Post()
  async create(@Res() res: Response, @Body() data): Promise<IResponse> {
    const result = await this.service.itgCreate(data);
    return this.responseSuccess(res, result);
  }

  @Put()
  async update(@Res() res: Response, @Body() data): Promise<IResponse> {
    const result = await this.service.itgUpdate(data);
    return this.responseSuccess(res, result);
  }

  @Post('/old-receipt')
  async createOldReceipt(
    @Res() res: Response,
    @Body() data,
  ): Promise<IResponse> {
    const result = await this.service.itgCreateOldReceipt(data);
    return this.responseSuccess(res, result);
  }

  @Put('/old-receipt')
  async updateOldReceipt(
    @Res() res: Response,
    @Body() data,
  ): Promise<IResponse> {
    const result = await this.service.itgUpdateOldReceipt(data);
    return this.responseSuccess(res, result);
  }

  @Get('/old-receipt/:old_receipt_id')
  async getOldReceiptById(
    @Res() res: Response,
    @Param('old_receipt_id') old_receipt_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getOldReceiptById(old_receipt_id);
    return this.responseSuccess(res, result);
  }

  @Put('/valuation-bill/:id')
  async updateValuationBillStatus(
    @Res() res: Response,
    @Param('id') id: number,
    @Body() data,
  ): Promise<IResponse> {
    const result = await this.service.updateValuationBillStatus(id, data);
    return this.responseSuccess(res, result);
  }
}
