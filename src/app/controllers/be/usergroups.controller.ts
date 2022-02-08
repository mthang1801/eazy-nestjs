import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  UseGuards,
  Req,
  Res,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { UserGroupsService } from '../../services/usergroups.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';
import { Response } from 'express';
import {
  CreateUserGroupPrivilegeDto,
  UpdateUserGroupPrivilegeDto,
} from '../../dto/usergroups/usergroup_privilege.dto';
import {
  CreateUserGroupsDto,
  UpdateUserGroupsDto,
} from 'src/app/dto/usergroups/usergroups.dto';

/**
 * User groups controllers
 * @author MvThang
 */
@Controller('/be/v1/usergroups')
export class UsergroupsController extends BaseController {
  constructor(private readonly usersGroupService: UserGroupsService) {
    super();
  }

  /**
   * Create new record in ddv_usergroups
   * @param createUserGroupsDto
   * @param req
   * @param res
   * @returns
   */
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() data: CreateUserGroupsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroup = await this.usersGroupService.Create(data);
    return this.responseSuccess(res, newUserGroup);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll(@Res() res: Response): Promise<IResponse> {
    const listUserGroup = await this.usersGroupService.GetAll();
    return this.responseSuccess(res, listUserGroup);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body() data: UpdateUserGroupsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const updatedUserGroup = await this.usersGroupService.Update(id, data);
    return this.responseSuccess(res, updatedUserGroup);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const boolRes = await this.usersGroupService.Delete(id);
    return boolRes
      ? this.responseSuccess(res, null, 'Xoá dữ liệu thành công')
      : this.respondNotFound(res, 'Xoá dữ liệu không thành công.');
  }

  @Get('links')
  async getLinks(@Query() params, @Res() res: Response): Promise<IResponse> {
    const userGroupLinksRes = await this.usersGroupService.GetLinks(params);
    return this.responseSuccess(res, userGroupLinksRes);
  }

  @Get('links/:id')
  async getLinksByUserGroupId(
    @Param('id') id: number,
    @Query() query,
    @Res() res: Response,
  ): Promise<IResponse> {
    const userGroupLink = await this.usersGroupService.GetLinksByUserGroupId(
      id,
      query,
    );
    return this.responseSuccess(res, userGroupLink);
  }

  /**
   * Get usergroup by usergroup_id
   * @param id
   * @param res
   * @returns
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  async get(@Param('id') id: number, @Res() res: Response): Promise<IResponse> {
    const userGroupRes = await this.usersGroupService.Get(id);
    return this.responseSuccess(res, userGroupRes);
  }

  /**
   * Create a new record at ddv_usergroup_privileges
   * @param data
   * @param res
   * @returns
   */
  @Post('/privilege')
  async createUserGroupPrivilege(
    @Body() data: CreateUserGroupPrivilegeDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroupPrivilege =
      await this.usersGroupService.createUserGroupPrivilege(data);
    return this.responseSuccess(res, newUserGroupPrivilege);
  }

  /**
   * Get list user groups privilege by usergroup_id
   * @param usergroup_id
   * @param res
   * @returns
   */
  @Get('/privilege/usergroup/:id')
  async getUserGroupPrivilegeByUserGroupId(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const userGroupPrivilegeList =
      await this.usersGroupService.getUserGroupPrivilegeByUserGroupId(id);
    return this.responseSuccess(res, userGroupPrivilegeList);
  }

  /**
   * Update a record by privilege_id at ddv_usergroup_privileges
   * @param data
   * @param res
   * @returns
   */
  @Put('/privilege/:id')
  async updateUserGroupPrivilege(
    @Body() data: UpdateUserGroupPrivilegeDto,
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroupPrivilege =
      await this.usersGroupService.updateUserGroupPrivilege(id, data);
    return this.responseSuccess(res, newUserGroupPrivilege);
  }

  /**
   * Delete a record at ddv_usergroup_privileges with param privilege_id
   * @param privilege_id
   * @param res
   * @returns
   */
  @Delete('/privilege/:id')
  async deleteUserGroupPrivilege(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const boolRes = await this.usersGroupService.deleteUserGroupPrivilege(id);
    return boolRes
      ? this.responseSuccess(res, null, 'Xoá dữ liệu thành công.')
      : this.respondNotFound(res, `Xoá không thành công.`);
  }
}
