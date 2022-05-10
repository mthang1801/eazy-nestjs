import { Body, Controller, Post, Res, Get, Param, Put } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { TestService } from '../../../services/test.service';
import { CreateTestDto } from '../../../dto/test/create-test.dto';
import { Response } from 'express';
import { UpdateTestDto } from '../../../dto/test/update-test.dto';
import { IResponse } from 'src/app/interfaces/response.interface';
@Controller('/be/v1/test')
export class TestController extends BaseController {
  constructor(private service: TestService) {
    super();
  }

  @Get()
  async getAll(@Res() res: Response) {
    const result = await this.service.getAll();
    return this.responseSuccess(res, result);
  }

  @Post()
  async create(@Res() res: Response, @Body() data: CreateTestDto,){
    await this.service.Testcreate(data);
    return this.responseSuccess(res, null, 'Success.');
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Res() res: Response,
    @Body() data: UpdateTestDto,
  ): Promise<IResponse> {
    await this.service.Testupdate(id, data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get(':id')
  async getById( @Res() res: Response, @Param('id') id: number,) {
    const result = await this.service.getById(id);
    return this.responseSuccess(res, result);
  }
}