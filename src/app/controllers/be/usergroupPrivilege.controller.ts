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
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { UserGroupsPrivilegeService } from '../../services/usergroupPrivilege.service';
import { IResponse } from 'src/app/interfaces/response.interface';
import { Response } from 'express';
import { AuthGuard } from '../../../middlewares/be.auth';
import { CreateUserGroupPrivilegeDto } from 'src/app/dto/usergroups/create-usergroupPrivilege.dto';
import { UpdateUserGroupPrivilegeDto } from 'src/app/dto/usergroups/update-usergroupPrivilege.dto';
@Controller('be/v1/usergroup-privilege')
export class UserGroupPrivilegeController extends BaseController {
  constructor(private readonly service: UserGroupsPrivilegeService) {
    super();
  }
  /**
   * Create a new record at ddv_usergroup_privileges
   * @param data
   * @param res
   * @returns
   */
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() data: CreateUserGroupPrivilegeDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroupPrivilege = await this.service.create(data);
    return this.responseSuccess(res, newUserGroupPrivilege);
  }
  /**
   * Get list user groups privilege by usergroup_id
   * @param id usergroup_id
   * @param res
   * @returns
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  async getListByUserGroupId(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const userGroupPrivilegeList = await this.service.getListByUserGroupId(id);
    return this.responseSuccess(res, userGroupPrivilegeList);
  }

  /**
   * Get all usergroup privilege
   * @param params should be page, limit, level, route, description, usergroup_id, method
   * @param res
   * @returns
   */
  @Get()
  @UseGuards(AuthGuard)
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const listDataRes = await this.service.getList(params);
    return this.responseSuccess(res, listDataRes);
  }

  /**
   * Update record by privilege_id
   * @param data  usergroup_id , privilege, description, parent_id, level, route, method, icon
   * @param id privilege_id
   * @param res
   * @returns
   */
  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Body() data: UpdateUserGroupPrivilegeDto,
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroupPrivilege = await this.service.update(id, data);
    return this.responseSuccess(res, newUserGroupPrivilege);
  }

  /**
   * Delete a record at ddv_usergroup_privileges with param privilege_id
   * @param id privilege_id
   * @param res
   * @returns
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const boolRes = await this.service.delete(id);
    return boolRes
      ? this.responseSuccess(res, null, 'Xoá dữ liệu thành công.')
      : this.responseNotFound(res, `Xoá không thành công.`);
  }
}
