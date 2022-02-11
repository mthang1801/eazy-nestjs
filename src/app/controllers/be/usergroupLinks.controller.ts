import {
  Controller,
  Get,
  Query,
  Res,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { UserGroupLinkService } from 'src/app/services/usergroupLinks.service';
import { BaseController } from '../../../base/base.controllers';

import { Response } from 'express';
import { AuthGuard } from '../../../middlewares/be.auth';
import { UpdateUserGroupLinkDto } from 'src/app/dto/usergroups/update-usergroupLink.dto';

@Controller('be/v1/usergroup-links')
export class UserGroupLinksController extends BaseController {
  constructor(private readonly service: UserGroupLinkService) {
    super();
  }
  /**
   * Get list users with optional params such as : page, limit, status...
   * @param params
   * @param res
   * @returns
   */
  @Get()
  @UseGuards(AuthGuard)
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const userGroupLinksRes = await this.service.getList(params);
    return this.responseSuccess(res, userGroupLinksRes);
  }

  /**
   * Get list users link by usergroup_id, params such as page, limit, status... should be injected into query
   * @param id usergroup_id
   * @param query page, limit, status
   * @param res
   * @returns
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  async getListUsersByUserGroupId(
    @Param('id') id: number,
    @Query() query,
    @Res() res: Response,
  ): Promise<IResponse> {
    const userGroupLink = await this.service.getListUsersByUserGroupId(
      id,
      query,
    );
    return this.responseSuccess(res, userGroupLink);
  }

  /**
   * Data should be usergroup_id param to update by user_id
   * @param id user_id
   * @param data usergroup_id
   * @param res
   * @returns
   */
  @Put(':id')
  @UseGuards(AuthGuard)
  async updateByUserId(
    @Param('id') id,
    @Body() data: UpdateUserGroupLinkDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const updatedLink = await this.service.updateByUserId(id, data);
    return this.responseSuccess(res, updatedLink);
  }
}
