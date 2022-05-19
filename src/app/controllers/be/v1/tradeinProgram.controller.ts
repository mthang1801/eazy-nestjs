import {
  Body,
  Get,
  Res,
  Post,
  UseGuards,
  Req,
  Param,
  Query,
  Put,
  Controller,
} from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { TradeinProgramService } from '../../../services/tradeinProgram.service';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { Response } from 'express';
import { CreateTradeinProgramDto } from '../../../dto/tradein/create-tradeinProgram.dto';
import { UpdateTradeinProgramDto } from '../../../dto/tradein/update-tradeinProgram.dto';
import { CreateValuationBillDto } from '../../../dto/tradein/create-valuationBill.dto';
@Controller('/be/v1/tradein-programs')
export class TradeinProgramController extends BaseController {
  constructor(private service: TradeinProgramService) {
    super();
  }

  @Post()
  async cmsCreate(
    @Res() res: Response,
    @Body() data: CreateTradeinProgramDto,
    @Req() req,
  ): Promise<IResponse> {
    const result = await this.service.cmsCreate(data, req.user);
    return this.responseSuccess(res, result);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get('/current-program')
  async getAppliedProgram(
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getListFE(params);
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

  @Get('old-receipts')
  async getOldReceiptsList(@Res() res: Response, @Query() params) {
    const result = await this.service.getOldReceiptsList(params);
    return this.responseSuccess(res, result);
  }

  @Get('old-receipts/:old_receipt_id')
  async getOldReceiptById(
    @Res() res: Response,
    @Param('old_receipt_id') old_receipt_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getOldReceiptById(old_receipt_id);
    return this.responseSuccess(res, result);
  }

  @Post('/valuation-bills')
  @UseGuards(AuthGuard)
  async createValuationBill(
    @Res() res: Response,
    @Req() req,
    @Body() data,
  ): Promise<IResponse> {
    const result = await this.service.CMScreateValuationBill(req.user, data);
    return this.responseSuccess(res, result);
  }

  @Get('valuation-bills')
  async getValuationBillsList(
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getValuationBillsList(params);
    return this.responseSuccess(res, result);
  }

  @Get('valuation-bills/:valuation_bill_id')
  async getValuationBillById(
    @Res() res: Response,
    @Param('valuation_bill_id') valuation_bill_id: number,
  ): Promise<IResponse> {
    const result = await this.service.CMSgetValuationBillById(
      valuation_bill_id,
    );
    return this.responseSuccess(res, result);
  }

  @Get(':tradein_id')
  @UseGuards(AuthGuard)
  async get(
    @Res() res: Response,
    @Param('tradein_id') tradein_id: number,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.get(tradein_id, params);
    return this.responseSuccess(res, result);
  }

  @Put(':tradein_id')
  @UseGuards(AuthGuard)
  async update(
    @Res() res: Response,
    @Param('tradein_id') tradein_id: number,
    @Body() data: UpdateTradeinProgramDto,
    @Req() req,
  ): Promise<IResponse> {
    const result = await this.service.update(tradein_id, data, req.user);
    return this.responseSuccess(res, result);
  }
}
