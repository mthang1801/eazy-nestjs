import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { UserGroupsPrivilegeService } from '../../services/usergroup_privilege.service';
import {
  CreateUserGroupPrivilegeDto,
  UpdateUserGroupPrivilegeDto,
} from '../../dto/usergroups/usergroup_privilege.dto';
import { IResponse } from 'src/app/interfaces/response.interface';
import { Response } from 'express';
@Controller('be/v1/usergroup_privilege')
export class UserGroupPrivilegeController extends BaseController {
  constructor(private readonly userGroupPrivilege: UserGroupsPrivilegeService) {
    super();
  }
  /**
   * Create a new record at ddv_usergroup_privileges
   * @param data
   * @param res
   * @returns
   */
  @Post()
  async create(
    @Body() data: CreateUserGroupPrivilegeDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroupPrivilege = await this.userGroupPrivilege.create(data);
    return this.responseSuccess(res, newUserGroupPrivilege);
  }
  /**
   * Get list user groups privilege by usergroup_id
   * @param id usergroup_id
   * @param res
   * @returns
   */
  @Get(':id')
  async getListByUserGroupId(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const userGroupPrivilegeList =
      await this.userGroupPrivilege.getListByUserGroupId(id);
    return this.responseSuccess(res, userGroupPrivilegeList);
  }

  @Get()
  async getAll(@Query() params, @Res() res: Response): Promise<IResponse> {
    const listDataRes = await this.userGroupPrivilege.getAll(params);
    return this.responseSuccess(res, listDataRes);
  }
  /**
   * Update record by privilege_id
   * @param data
   * @param id privilege_id
   * @param res
   * @returns
   */
  @Put(':id')
  async update(
    @Body() data: UpdateUserGroupPrivilegeDto,
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroupPrivilege = await this.userGroupPrivilege.update(
      id,
      data,
    );
    return this.responseSuccess(res, newUserGroupPrivilege);
  }
  /**
   * Delete a record at ddv_usergroup_privileges with param privilege_id
   * @param id privilege_id
   * @param res
   * @returns
   */
  @Delete(':id')
  async delete(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const boolRes = await this.userGroupPrivilege.delete(id);
    return boolRes
      ? this.responseSuccess(res, null, 'Xoá dữ liệu thành công.')
      : this.responseNotFound(res, `Xoá không thành công.`);
  }
}
