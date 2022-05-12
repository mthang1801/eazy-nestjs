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
  Req,
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { RoleFunctService } from '../../../services/roleFunct.service';
import { IResponse } from 'src/app/interfaces/response.interface';
import { Response } from 'express';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { CreateUserGroupPrivilegeDto } from 'src/app/dto/usergroups/create-usergroupPrivilege.dto';
import { UpdateUserGroupPrivilegeDto } from 'src/app/dto/usergroups/update-usergroupPrivilege.dto';
@Controller('be/v1/role-functions')
export class RoleFunctController extends BaseController {
  constructor(private readonly service: RoleFunctService) {
    super();
  }
  /**
   * Create a new record at ddv_roles_functs
   * @param data
   * @param res
   * @returns
   */
  @Post()
  //@UseGuards(AuthGuard)
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
  //@UseGuards(AuthGuard)
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
  async getList(@Res() res: Response, @Req() req): Promise<IResponse> {
    const result = await this.service.getList(req.user);
    return this.responseSuccess(res, result);
  }

  /**
   * Update record by privilege_id
   * @param data  usergroup_id , privilege, description, parent_id, level, route, method, icon
   * @param id privilege_id
   * @param res
   * @returns
   */
  @Put(':id')
  //@UseGuards(AuthGuard)
  async update(
    @Body() data: UpdateUserGroupPrivilegeDto,
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroupPrivilege = await this.service.update(id, data);
    return this.responseSuccess(res, newUserGroupPrivilege);
  }
}
