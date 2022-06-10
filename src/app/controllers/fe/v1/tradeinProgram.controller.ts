import {
  Controller,
  Query,
  Res,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';

import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { TradeinProgramService } from '../../../services/tradeinProgram.service';
import { AuthGuard } from '../../../../middlewares/fe.auth';
import { ValuateBillDto } from '../../../dto/tradein/valuateBill.dto';
import { Req } from '@nestjs/common';
@Controller('fe/v1/tradein-programs')
export class TradeinProgramController extends BaseController {
  constructor(private service: TradeinProgramService) {
    super();
  }

  @Get()
  async getList(@Res() res: Response): Promise<IResponse> {
    const result = await this.service.getListFE();
    return this.responseSuccess(res, result);
  }

  @Get(':tradein_id')
  async getById(
    @Res() res: Response,
    @Param('tradein_id') tradein_id: number,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getById(tradein_id, params);
    return this.responseSuccess(res, result);
  }

  @Post('/valuation-bill')
  async createValuationBill(
    @Res() res: Response,
    @Body() data,
  ): Promise<IResponse> {
    const result = await this.service.createValuationBill(data);
    return this.responseSuccess(res, result);
  }

  @Get('/old-receipts/:user_id')
  async getOldReceiptByUserId(
    @Res() res: Response,
    @Param('user_id') user_id: number,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getOldReceiptByUserId(user_id, params);
    return this.responseSuccess(res, result);
  }

  @Get('/valuation-bill')
  @UseGuards(AuthGuard)
  async getValuationBills(
    @Res() res: Response,
    @Req() req,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.FEgetValuationBills(req.user, params);
    return this.responseSuccess(res, result);
  }

  @Get('/:product_id/criteria-set')
  async getListCriteria(
    @Res() res: Response,
    @Param('product_id') product_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getCriteriaList(product_id);
    return this.responseSuccess(res, result);
  }

  @Get('valuation-bill/:valuation_bill_id')
  @UseGuards(AuthGuard)
  async FEgetValuationBillById(
    @Res() res: Response,
    @Req() req,
    @Param('valuation_bill_id') valuation_bill_id: number,
  ): Promise<IResponse> {
    const result = await this.service.FEgetValuationBillById(
      req.user,
      valuation_bill_id,
    );
    return this.responseSuccess(res, result);
  }

  @Post('/valuation-bill/valuation')
  async getValuationBill(
    @Body() data: ValuateBillDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getValuationBill(data);
    return this.responseSuccess(res, result);
  }

  @Get('/valuation-bill/:id')
  async getValuationBillById(@Res() res, @Param('id') id): Promise<IResponse> {
    const result = await this.service.getValuationBillById(id);
    return this.responseSuccess(res, result);
  }
}
