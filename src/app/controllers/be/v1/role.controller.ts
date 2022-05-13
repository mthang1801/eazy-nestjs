import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  UseGuards,
  Res,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';

import { RoleService } from '../../../services/role.service';
import { BaseController } from '../../../../base/base.controllers';
import { IResponse } from '../../../interfaces/response.interface';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { Response, Request } from 'express';
import { CreateUserGroupsDto } from 'src/app/dto/usergroups/create-usergroups.dto';
import { UpdateUserGroupsDto } from 'src/app/dto/usergroups/update-usergroups.dto';
import { CreateGroupDto } from '../../../dto/role/create-user-role.dto';
import { UpdateRoleGroupDto } from '../../../dto/role/update-roleGroup.dto';
import { AuthorizeRoleFunctionDto } from '../../../dto/userRole/authorizeRoleFunct';

/**
 * User groups controllers
 * @author MvThang
 */
@Controller('/be/v1/user-groups')
@UseGuards(AuthGuard)
export class RoleController extends BaseController {
  constructor(private readonly service: RoleService) {
    super();
  }

  /**
   * Tạo nhóm người dùng
   * @param res
   * @param data
   * @returns
   */
  @Post()
  async createRoleGroup(
    @Res() res: Response,
    @Body() data: CreateGroupDto,
    @Req() req: Request,
  ) {
    const result = await this.service.createRoleGroup(data, req['user']);
    return this.responseSuccess(res, result);
  }

  /**
   * Cập nhật nhóm người dùng
   * @param id
   * @param res
   * @param data
   * @returns
   */
  @Put('/:id')
  async updateRoleGroup(
    @Param('id') id: number,
    @Res() res: Response,
    @Body() data: UpdateRoleGroupDto,
    @Req() req: Request,
  ): Promise<IResponse> {
    await this.service.updateRoleGroup(id, data, req['user']);
    return this.responseSuccess(res);
  }

  /**
   * Gắn quyền vào người dùng
   * @param role_id
   * @param data
   * @param res
   * @returns
   */
  @Put('/role-functs/:role_id')
  async authorizeRoleFunct(
    @Param('role_id') role_id: number,
    @Body() data: AuthorizeRoleFunctionDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.authorizeRoleFunct(role_id, data);
    return this.responseSuccess(res);
  }

  @Get('/functions')
  // @UseGuards(AuthGuard)
  async getFunctions(@Res() res: Response) {
    const result = await this.service.getFunctions();
    return this.responseSuccess(res, result);
  }

  @Get()
  async getGroupList(@Res() res: Response, @Query() params) {
    const result = await this.service.getGroupList(params);
    return this.responseSuccess(res, result);
  }

  @Get('/:id')
  async getGroupById(
    @Res() res: Response,
    @Param('id') id: number,
    @Query() params,
  ) {
    const result = await this.service.getGroupById(id);
    return this.responseSuccess(res, result);
  }

  /**
   * Create a record in ddv_roles and ddv_usergroup_description
   * @param data type : string, usergroup : string, company_id : number, lang_code : string
   * @param res
   * @returns
   */
  @Post()
  async create(
    @Body() data: CreateUserGroupsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.create(data);
    return this.responseSuccess(res, result);
  }

  @Get()
  async getList(
    @Res() res: Response,
    @Req() req,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getList(req.user, params);
    return this.responseSuccess(res, result);
  }

  /**
   * Get usergroup by usergroup_id
   * @param id
   * @param res
   * @returns
   */
  @Get(':id')
  async getByUserGroupId(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getByUserGroupId(id);
    return this.responseSuccess(res, result);
  }

  /**
   * Update record by usergroup_id
   * @param id
   * @param data  type : string, usergroup : string, company_id : number, lang_code : string
   * @param res
   * @returns
   */
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: UpdateUserGroupsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.update(id, data);
    return this.responseSuccess(res, result);
  }
}
