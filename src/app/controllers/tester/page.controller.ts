import { Controller, Post, Res, Body, Put, Get, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { CreateOrUpdatePageDetailDto } from '../../dto/page-tester/create-update-pageDetailItem.dto';
import { PageService } from '../../services/page.service';
import { UpdatePageDetailsPosition } from '../../dto/page-tester/update-pageDetailsPosition.dto';
import { CreateOrUpdatePageDetailValueItemDto } from 'src/app/dto/page-tester/create-update-pageDetailValueItem.dto';
import { UpdatePageDetailValuesPositionDto } from '../../dto/page-tester/update-pageDetailValuesPosition.dto';
@Controller('web-tester/v1/pages')
export class PageControllerTester extends BaseController {
  constructor(private service: PageService) {
    super();
  }
  @Post('/page-details')
  async createOrUpdatePageDetailItem(
    @Res() res: Response,
    @Body() data: CreateOrUpdatePageDetailDto,
  ) {
    await this.service.testCreateOrUpdatePageDetailItem(data);
    return this.responseSuccess(res);
  }

  @Put('/page-details/update-position')
  async updatePageDetailsPosition(
    @Res() res: Response,
    @Body() data: UpdatePageDetailsPosition,
  ) {
    await this.service.testUpdatePageDetailsPosition(data);
    return this.responseSuccess(res);
  }

  @Post('/page-details/values')
  async createOrUpdatePageDetailValueItem(
    @Res() res: Response,
    @Body() data: CreateOrUpdatePageDetailValueItemDto,
  ) {
    await this.service.testCreateOrUpdatePageDetailValueItem(data);
    return this.responseSuccess(res);
  }

  @Put('/page-details/values/update-position')
  async updatePageDetailValuePosition(
    @Res() res: Response,
    @Body() data: UpdatePageDetailValuesPositionDto,
  ) {
    await this.service.testUpdatePageDetailValuePosition(data);
    return this.responseSuccess(res);
  }

  @Get(':page_id')
  async getPageInfo(@Res() res: Response, @Param('page_id') page_id: number) {
    const result = await this.service.testGetPageInfo(page_id);
    return this.responseSuccess(res, result);
  }

  @Get('page-details/:page_detail_id')
  async getPageDetailInfo(
    @Res() res: Response,
    @Param('page_detail_id') page_detail_id: number,
  ) {
    const result = await this.service.testGetPageDetailInfo(page_detail_id);
    return this.responseSuccess(res, result);
  }

  @Get('page-details/values/:value_id')
  async getPageDetailValueInfo(
    @Res() res: Response,
    @Param('value_id') value_id: number,
  ) {
    const result = await this.service.testGetPageDetailValueInfo(value_id);
    await this.responseSuccess(res, result);
  }
}
