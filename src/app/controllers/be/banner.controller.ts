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
import { BannerService } from '../../services/banner.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';

import {} from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/fe.auth';
import { BannerCreateDTO } from 'src/app/dto/banner/create-banner.dto';
import { UpdateBannerDTO } from 'src/app/dto/banner/update-banner.dto';
import { updateBannerImageDTO } from 'src/app/dto/banner/update-banner-image.dto';
import { createBannerImageDTO } from 'src/app/dto/banner/create-banner-image.dto';
@Controller('/be/v1/banner')
export class BannerController extends BaseController {
  constructor(private service: BannerService) {
    super();
  }

  @Get()
  async getAllBanners(@Res() res, @Param() param): Promise<IResponse> {
    const banners = await this.service.getAll(param);
    return this.responseSuccess(res, banners);
  }

  @Get('/:id')
  async getAllBannersById(@Res() res, @Param('id') id): Promise<IResponse> {
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
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard)
  async createBanner(
    @Res() res,
    @Body() body: BannerCreateDTO,
  ): Promise<IResponse> {
    const banner = await this.service.Create(body);
    return this.responseSuccess(res, banner);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard)
  async updateBannerbyId(
    @Res() res,
    @Body() body: UpdateBannerDTO,
    @Param('id') id,
  ): Promise<IResponse> {
    const banner = await this.service.Update(body, id);
    return this.responseSuccess(res, banner);
  }

  @Delete('/:banner_id/images/:images_id')
  @UseGuards(AuthGuard)
  async deleteBannerById(
    @Res() res,
    @Param('banner_id') banner_id,
    @Param('images_id') images_id,
  ): Promise<IResponse> {
    const banner = await this.service.Delete(banner_id, images_id);

    return this.responseSuccess(res, banner);
  }
  @Put('/:banner_id/images/:images_id')
  @UseGuards(AuthGuard)
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
  // @UseGuards(AuthGuard)
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
