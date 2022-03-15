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
import { bannerService } from '../../services/banner.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';

import {} from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';

import { updateBannerImageDTO } from 'src/app/dto/banner/update-banner-image.dto';
import { createBannerImageDTO } from 'src/app/dto/banner/create-banner-image.dto';
import { CreateBannerDto } from 'src/app/dto/banner/create-banner.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { UpdateBannerDTO } from '../../dto/banner/update-banner.dto';
import { Query } from '@nestjs/common';
import { Response } from 'express';
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

  @Get('/:id')
  async getById(@Res() res: Response, @Param('id') id): Promise<IResponse> {
    const banners = await this.service.getById(id);
    return this.responseSuccess(res, banners);
  }

  @Post()
  async create(
    @Res() res: Response,
    @Body() body: CreateBannerDto,
  ): Promise<IResponse> {
    const banner = await this.service.create(body);
    return this.responseSuccess(res, banner);
  }

  /**
   * Upload product image
   * @param files
   * @param res
   * @param sku
   * @returns
   */

  @Post('upload-images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, './uploads'),
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
            file.originalname
          }`;
          return cb(null, filename);
        },
      }),
    }),
  )
  async uploadImages(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res: Response,
  ) {
    const result = await this.service.uploadImages(files);

    return this.responseSuccess(res, result, 'Upload hình ảnh thành công.');
  }

  @Get('/:id/images')
  async getAllIamgesByBannerId(
    @Res() res,
    @Param('id') id,
  ): Promise<IResponse> {
    const banners = await this.service.getAllIamgesByBannerId(id);
    return this.responseSuccess(res, banners);
  }

  @Put('/:id')
  //@UseGuards(AuthGuard)
  async updateBannerbyId(
    @Res() res,
    @Body() data: UpdateBannerDTO,
    @Param('id') id: number,
  ): Promise<IResponse> {
    const result = await this.service.update(id, data);
    return this.responseSuccess(res, result);
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
