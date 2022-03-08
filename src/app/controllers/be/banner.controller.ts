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
} from '@nestjs/common';
import { bannerService } from '../../services/banner.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';

import {} from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';
import { updateBannerDTO } from 'src/app/dto/banner/update-banner.dto';
import { updateBannerImageDTO } from 'src/app/dto/banner/update-banner-image.dto';
import { createBannerImageDTO } from 'src/app/dto/banner/create-banner-image.dto';
import { CreateBannerDto } from 'src/app/dto/banner/create-banner.dto';
@Controller('/be/v1/banner')
export class bannerController extends BaseController {
  constructor(private service: bannerService) {
    super();
  }

  @Get()
  async getList(@Res() res, @Param() param): Promise<IResponse> {
    const banners = await this.service.getList(param);
    return this.responseSuccess(res, banners);
  }

  @Get('/:id')
  async getById(@Res() res, @Param('id') id): Promise<IResponse> {
    const banners = await this.service.getById(id);
    return this.responseSuccess(res, banners);
  }

  @Get('/:id/images')
  async getAllIamgesByBannerId(
    @Res() res,
    @Param('id') id,
  ): Promise<IResponse> {
    const banners = await this.service.getAllIamgesByBannerId(id);
    return this.responseSuccess(res, banners);
  }

  @Post()
  //@UseGuards(AuthGuard)
  async create(@Res() res, @Body() body: CreateBannerDto): Promise<IResponse> {
    const banner = await this.service.create(body);
    return this.responseSuccess(res, banner);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  //@UseGuards(AuthGuard)
  async updateBannerbyId(
    @Res() res,
    @Body() body: updateBannerDTO,
    @Param('id') id,
  ): Promise<IResponse> {
    const banner = await this.service.update(body, id);
    return this.responseSuccess(res, banner);
  }

  @Delete('/:banner_id/images/:images_id')
  //@UseGuards(AuthGuard)
  async deleteBannerById(
    @Res() res,
    @Param('banner_id') banner_id,
    @Param('images_id') images_id,
  ): Promise<IResponse> {
    const banner = await this.service.Delete(banner_id, images_id);

    return this.responseSuccess(res, banner);
  }
  @Put('/:banner_id/images/:images_id')
  //@UseGuards(AuthGuard)
  async updateBannerById(
    @Res() res,
    @Param('banner_id') banner_id,
    @Param('images_id') images_id,
    @Body() body: updateBannerImageDTO,
  ): Promise<IResponse> {
    const banner = await this.service.updateBannerById(
      banner_id,
      images_id,
      body,
    );

    return this.responseSuccess(res, banner);
  }

  @Post('/:id/createimages')
  @UsePipes(ValidationPipe)
  //@UseGuards(AuthGuard)
  async createBannerImage(
    @Res() res,
    @Body() body: createBannerImageDTO,
    @Param('id') id,
  ): Promise<IResponse> {
    // const banner = await this.service.createBannerImage(body, id);
    const banner = {};
    return this.responseSuccess(res, banner);
  }
}
