import {
  Controller,
  Get,
  Res,
  Query,
  Body,
  Post,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';

import { Response } from 'express';
import { StoreService } from 'src/app/services/store.service';
import { BaseController } from '../../../../base/base.controllers';
import { CreateStoreDto } from '../../../dto/stores/create-store.dto';
import { UpdateStoreDto } from 'src/app/dto/stores/update-store.dto';
import { AuthGuard } from '../../../../middlewares/be.auth';

@Controller('/be/v1/stores')
@UseGuards(AuthGuard)
export class StoreController extends BaseController {
  constructor(private service: StoreService) {
    super();
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get('/all')
  async getAll(@Res() res: Response): Promise<IResponse> {
    const result = await this.service.getAll();
    return this.responseSuccess(res, result);
  }

  @Post()
  async create(
    @Res() res: Response,
    @Body() data: CreateStoreDto,
  ): Promise<IResponse> {
    await this.service.CMScreate(data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Put(':store_location_id')
  async update(
    @Param('store_location_id') store_location_id: number,
    @Res() res: Response,
    @Body() data: UpdateStoreDto,
  ): Promise<IResponse> {
    await this.service.CMSupdate(store_location_id, data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get(':store_location_id')
  async getById(
    @Res() res: Response,
    @Param('store_location_id') store_location_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getById(store_location_id);
    return this.responseSuccess(res, result);
  }
}
