import {
  Controller,
  UseGuards,
  Param,
  Body,
  Res,
  Put,
  Query,
} from '@nestjs/common';
import { UpdateUserGroupsDto } from 'src/app/dto/usergroups/update-usergroups.dto';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';
import { UserSystemService } from '../../services/userSystem.service';
import { Get } from '@nestjs/common';
import { UpdateUserSystemDto } from 'src/app/dto/userSystem/update-userSystem.dto';

@Controller('/be/v1/user-system')
export class UserSystemController extends BaseController {
  constructor(private service: UserSystemService) {
    super();
  }

  /**
   * get All User, using query params to filter such as page, limit, status, lang_code, type...
   * @param res
   * @param params
   * @returns
   */
  @Get()
  // @UseGuards(AuthGuard)
  async getUserLists(
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getUserLists(params);
    return this.responseSuccess(res, result);
  }

  @Put(':id')
  // @UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body() data: UpdateUserSystemDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.update(id, data);
    return this.responseSuccess(res, result);
  }
}
