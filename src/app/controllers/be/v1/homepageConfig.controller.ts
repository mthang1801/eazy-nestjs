import { Controller, Post, Res, Body } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
@Controller('be/v1/homepage-configure')
export class HomepageConfigureController extends BaseController {
  @Post()
  async create(@Res() res: Response, @Body() data) {}
}
