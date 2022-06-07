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
import { PageService } from '../../../services/page.service';
import { Response } from 'express';
import { CreateOrUpdatePageDetailDto } from '../../../dto/page-tester/create-update-pageDetailItem.dto';
import { UpdatePageDetailsPosition } from '../../../dto/page-tester/update-pageDetailsPosition.dto';
import { CreateOrUpdatePageDetailValueItemDto } from '../../../dto/page-tester/create-update-pageDetailValueItem.dto';
import { UpdatePageDetailValuesPositionDto } from '../../../dto/page-tester/update-pageDetailValuesPosition.dto';
@Controller('be/v1/pages')
export class PageController extends BaseController {
  constructor(private service: PageService) {
    super();
  }
  @Post('/page-details')
  async createOrUpdatePageDetailItem(
    @Res() res: Response,
    @Body() data: CreateOrUpdatePageDetailDto,
  ) {
    await this.service.createOrUpdatePageDetailItem(data);
    return this.responseSuccess(res);
  }

  @Put('/page-details/update-position')
  async updatePageDetailsPosition(
    @Res() res: Response,
    @Body() data: UpdatePageDetailsPosition,
  ) {
    await this.service.updatePageDetailsPosition(data);
    return this.responseSuccess(res);
  }

  @Post('/page-details/values')
  async createOrUpdatePageDetailValueItem(
    @Res() res: Response,
    @Body() data: CreateOrUpdatePageDetailValueItemDto,
  ) {
    await this.service.createOrUpdatePageDetailValueItem(data);
    return this.responseSuccess(res);
  }

  @Put('/page-details/values/update-position')
  async updatePageDetailValuePosition(
    @Res() res: Response,
    @Body() data: UpdatePageDetailValuesPositionDto,
  ) {
    await this.service.updatePageDetailValuePosition(data);
    return this.responseSuccess(res);
  }

  @Get()
  async getPages(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getPages(params);
    return this.responseSuccess(res, result);
  }

  @Get('page-details/:page_detail_id')
  async getPageDetailInfo(
    @Res() res: Response,
    @Param('page_detail_id') page_detail_id: number,
  ) {
    const result = await this.service.getPageDetailInfo(page_detail_id);
    return this.responseSuccess(res, result);
  }

  @Get(':page_id')
  async getPageInfo(@Res() res: Response, @Param('page_id') page_id: number) {
    const result = await this.service.getPageInfo(page_id);
    return this.responseSuccess(res, result);
  }

  @Get('page-details/values/:value_id')
  async getPageDetailValueInfo(
    @Res() res: Response,
    @Param('value_id') value_id: number,
  ) {
    const result = await this.service.getPageDetailValueInfo(value_id);
    await this.responseSuccess(res, result);
  }
}
