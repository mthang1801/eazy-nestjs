import {
  Controller,
  Get,
  Query,
  Res,
  Body,
  Param,
  Put,
  UseGuards,
  Post,
} from '@nestjs/common';
import { IResponse } from 'src/app/interfaces/response.interface';
import { UserRoleService } from 'src/app/services/userRole.service';
import { BaseController } from '../../../../base/base.controllers';

import { Response } from 'express';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { UpdateUserGroupLinkDto } from 'src/app/dto/usergroups/update-usergroupLink.dto';
import { CreateUserGroupPrivilegeDto } from '../../../dto/usergroups/create-usergroupPrivilege.dto';
import { CreateGroupDto } from '../../../dto/role/create-user-role.dto';

@Controller('be/v1/user-role')
export class UserRoleController extends BaseController {
  constructor(private readonly service: UserRoleService) {
    super();
  }


  @Post('/group')
  async createGroup(@Res() res: Response, @Body() data: CreateGroupDto,){
    await this.service.createGroup(data);
    return this.responseSuccess(res)
  }

  @Get('/group')
  async getGroup(@Res() res: Response) {
    const result = await this.service.getGroup();
    return this.responseSuccess(res, result);
  }

  /**
   * Get list users with optional params such as : page, limit, status...
   * @param params
   * @param res
   * @returns
   */
  @Get()
  //@UseGuards(AuthGuard)
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
  //@UseGuards(AuthGuard)
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
  //@UseGuards(AuthGuard)
  async updateByUserId(
    @Param('id') id,
    @Body() data: UpdateUserGroupLinkDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const updatedLink = await this.service.updateByUserId(id, data);
    return this.responseSuccess(res, updatedLink);
  }
}
