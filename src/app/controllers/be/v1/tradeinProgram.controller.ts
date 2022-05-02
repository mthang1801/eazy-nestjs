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
@Controller('/be/v1/tradein-programs')
export class TradeinProgramController extends BaseController {
  constructor(private service: TradeinProgramService) {
    super();
  }

  @Post()
  @UseGuards(AuthGuard)
  async cmsCreate(
    @Res() res: Response,
    @Body() data,
    @Req() req,
  ): Promise<IResponse> {
    const result = await this.service.cmsCreate(data, req.user);
    return this.responseSuccess(res, result);
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':tradein_id')
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
    @Body() data,
    @Req() req,
  ): Promise<IResponse> {
    const result = await this.service.update(tradein_id, data, req.user);
    return this.responseSuccess(res, result);
  }
}