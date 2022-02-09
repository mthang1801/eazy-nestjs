import { Controller, Get, Query, Res, Body, Param, Put } from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { UserGroupLinkService } from 'src/app/services/usergroup_links.service';
import { BaseController } from '../../../base/base.controllers';
import { UpdateUserGroupLinkDto } from '../../dto/usergroups/usergroup_link.dto';
import { Response } from 'express';
@Controller('be/v1/usergroup_links')
export class UserGroupLinksController extends BaseController {
  constructor(private readonly userGroupLinksService: UserGroupLinkService) {
    super();
  }
  /**
   * Get list users with optional params such as : page, limit, status...
   * @param params
   * @param res
   * @returns
   */
  @Get()
  async getAll(@Query() params, @Res() res: Response): Promise<IResponse> {
    const userGroupLinksRes = await this.userGroupLinksService.getAll(params);
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
  async getListUsersByUserGroupId(
    @Param('id') id: number,
    @Query() query,
    @Res() res: Response,
  ): Promise<IResponse> {
    const userGroupLink =
      await this.userGroupLinksService.getListUsersByUserGroupId(id, query);
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
  async updateByUserId(
    @Param('id') id,
    @Body() data: UpdateUserGroupLinkDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const updatedLink = await this.userGroupLinksService.updateByUserId(
      id,
      data,
    );
    return this.responseSuccess(res, updatedLink);
  }
}
