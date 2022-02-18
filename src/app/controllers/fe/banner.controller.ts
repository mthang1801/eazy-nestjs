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
  import { bannerCreateDTO } from 'src/app/dto/banner/create-banner.dto';
  import { updateBannerDTO } from 'src/app/dto/banner/update-banner.dto';
  import { updateBannerImageDTO } from 'src/app/dto/banner/update-banner-image.dto';
  import { createBannerImageDTO } from 'src/app/dto/banner/create-banner-image.dto';
  @Controller('/fe/v1/banners')
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
  
  
  }
  