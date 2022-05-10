import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { bannerService } from '../../../services/banner.service';
import { BaseController } from '../../../../base/base.controllers';
import { IResponse } from '../../../interfaces/response.interface';

import {} from '../../../interfaces/response.interface';
import { AuthGuard } from '../../../../middlewares/be.auth';

import { CreateBannerDto } from 'src/app/dto/banner/create-banner.dto';

import * as multer from 'multer';
import { UpdateBannerDTO } from '../../../dto/banner/update-banner.dto';
import { Query } from '@nestjs/common';
import { Response } from 'express';
import { CreateBannerTargetDescriptionDto } from '../../../dto/banner/create-bannerTargetDescription.dto';
import { createPool } from 'mysql2/promise';
import { UpdateBannerTargetDescriptionDto } from '../../../dto/banner/update-bannerTargetDescription.dto';
@Controller('/be/v1/banners')
export class bannerController extends BaseController {
  constructor(private service: bannerService) {
    super();
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const banners = await this.service.getList(params);
    return this.responseSuccess(res, banners);
  }

  @Get('/locations')
  async getLocationsList(@Res() res: Response): Promise<IResponse> {
    const result = await this.service.getLocationsList();
    return this.responseSuccess(res, result);
  }

  @Get('/targets')
  async getTargetsList(@Res() res: Response): Promise<IResponse> {
    const result = await this.service.getTargetsList();
    return this.responseSuccess(res, result);
  }

  @Post('/page-target')
  async createBannerTargetDescription(@Res() res: Response, @Body() data: CreateBannerTargetDescriptionDto,){
    await this.service.BannerTargetDescriptioncreate(data);
    return this.responseSuccess(res, null, 'Tạo thành công banner target mới.');
  }

  @Post()
  async create(
    @Res() res: Response,
    @Body() body: CreateBannerDto,
  ): Promise<IResponse> {
    const banner = await this.service.create(body);
    return this.responseSuccess(res, banner);
  }

  @Get('/page-target')
  async getAllBannerTarget(@Res() res: Response) {
    const result = await this.service.getAllBannerTarget();
    return this.responseSuccess(res, result);
  }

  @Get('/:id')
  async getById(@Res() res: Response, @Param('id') id): Promise<IResponse> {
    const banners = await this.service.getById(id);
    return this.responseSuccess(res, banners);
  }

  @Put('/:id')
  //@UseGuards(AuthGuard)
  async updateBannerbyId(
    @Res() res,
    @Body() data: UpdateBannerDTO,
    @Param('id') id: number,
  ): Promise<IResponse> {
    await this.service.update(id, data);
    return this.responseSuccess(res, null, 'Cập nhật thành công');
  }

  @Delete('/:banner_id')
  //@UseGuards(AuthGuard)
  async deleteBannerById(
    @Res() res,
    @Param('banner_id') banner_id: number,
  ): Promise<IResponse> {
    await this.service.delete(banner_id);
    return this.responseSuccess(res, '', 'Xoá thành công.');
  }


}
