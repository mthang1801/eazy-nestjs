import { Controller, Get, Res } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { BaseController } from '../../../../base/base.controllers';
import { DashboardService } from '../../../services/dashboard.service';
import { Response } from 'express';
@Controller('/be/v1/dashboard')
export class DashboardController extends BaseController {
  constructor(private service: DashboardService) {
    super();
  }
  @Get()
  async getReportOverview(@Res() res: Response): Promise<IResponse> {
    const result = await this.service.getReportOverview();
    return this.responseSuccess(res, result);
  }
}
