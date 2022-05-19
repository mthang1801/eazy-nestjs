import {
  Controller,
  Res,
  Post,
  Body,
  Put,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { CreatePageDto } from '../../../dto/page/create-page.dto';
import { PageService } from '../../../services/page.service';
import { UpdatePageDto } from '../../../dto/page/update-page.dto';
import { CreatePageDetailDto } from '../../../dto/page/create-pageDetail.dto';
import { UpdatePageDetailDto } from '../../../dto/page/update-pageDetail.dto';
import { Response } from 'express';
import { UpdatePageDetailStatus } from '../../../dto/page/update-pageDetailStatus.dto';
import { CreatePageDetailValuesDto } from '../../../dto/page/create-pageDetailValues.dto';
import { UpdatePageDetailValueDto } from '../../../dto/page/update-pageDetailValue.dto';
import { CreatePageDetailValueDto } from '../../../dto/page/create-pageDetailValue.dto';
import { CreatePageDetailItemDto } from '../../../dto/page/create-pageDetailItem.dto';
@Controller('be/v1/pages')
export class PageController extends BaseController {
  constructor(private service: PageService) {
    super();
  }
  @Post()
  async createPage(
    @Res() res: Response,
    @Body() data: CreatePageDto,
  ): Promise<IResponse> {
    await this.service.createPage(data);
    return this.responseSuccess(res);
  }

  @Put(':page_id')
  async updatePage(
    @Param('page_id') page_id: number,
    @Res() res: Response,
    @Body() data: UpdatePageDto,
  ): Promise<IResponse> {
    await this.service.updatePage(page_id, data);
    return this.responseSuccess(res);
  }

  @Post('/:page_id/page-details')
  async createPageDetail(
    @Res() res: Response,
    @Body() data: CreatePageDetailDto,
    @Param('page_id') page_id: number,
  ): Promise<IResponse> {
    await this.service.createPageDetail(page_id, data);
    return this.responseSuccess(res);
  }

  @Put('/:page_id/page-details')
  async updatePageDetail(
    @Res() res: Response,
    @Body() data: UpdatePageDetailDto,
    @Param('page_id') page_id: number,
  ): Promise<IResponse> {
    await this.service.updatePageDetail(page_id, data);
    return this.responseSuccess(res);
  }

  @Put('/page-details/:page_detail_id/update-status')
  async updatePageDetailStatus(
    @Res() res: Response,
    @Param('page_detail_id') page_detail_id: number,
    @Body('status') status: string,
  ) {
    await this.service.updatePageDetailStatus(page_detail_id, status);
    await this.responseSuccess(res);
  }

  @Post('/page-details/:page_detail_id')
  async createPageDetailValues(
    @Res() res: Response,
    @Param('page_detail_id') page_detail_id: number,
    @Body() data: CreatePageDetailValuesDto,
  ): Promise<IResponse> {
    await this.service.createPageDetailValues(page_detail_id, data);
    return this.responseSuccess(res);
  }

  @Post('/page-details/:page_detail_id/value')
  async createPageDetailValue(
    @Res() res: Response,
    @Param('page_detail_id') page_detail_id: number,
    @Body() data: CreatePageDetailValueDto,
  ): Promise<IResponse> {
    await this.service.createPageDetailValue(page_detail_id, data);
    return this.responseSuccess(res);
  }

  @Put('/page-details/values/:value_id/update-status')
  async updatePageDetailValueStatus(
    @Res() res: Response,
    @Param('value_id') value_id: number,
    @Body('status') status: string,
  ): Promise<IResponse> {
    await this.service.updatePageDetailValueStatus(value_id, status);
    return this.responseSuccess(res);
  }

  @Get()
  async getPages(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getPages(params);
    return this.responseSuccess(res, result);
  }

  @Get('cms/:page_id')
  async getPageDetailCms(
    @Res() res: Response,
    @Param('page_id') page_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getPageDetailCms(page_id);
    return this.responseSuccess(res, result);
  }

  @Get(':page_id')
  async getPageDetail(
    @Res() res: Response,
    @Param('page_id') page_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getPageDetail(page_id);
    return this.responseSuccess(res, result);
  }

  @Get('page-details/:page_detail_id')
  async getPageDetailValues(
    @Res() res: Response,
    @Param('page_detail_id') page_detail_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getPageDetailValues(page_detail_id);
    return this.responseSuccess(res, result);
  }

  @Post('page-details')
  async createPageDetailItem(
    @Res() res,
    @Body() data: CreatePageDetailItemDto,
  ): Promise<IResponse> {
    await this.service.createPageDetailItem(data);
    return this.responseSuccess(res);
  }

  @Get('page-details/:page_detail_id')
  async getPageDetailItem(
    @Res() res,
    @Param() page_detail_id: number,
  ): Promise<IResponse> {
    let result = await this.service.getPageDetailItem(page_detail_id);
    return this.responseSuccess(res, result);
  }
}
