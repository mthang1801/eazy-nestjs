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
import { Response } from 'express';
import { CreateUserGroupsDto } from 'src/app/dto/usergroups/create-usergroups.dto';
import { UpdateUserGroupsDto } from 'src/app/dto/usergroups/update-usergroups.dto';
import { CreateGroupDto } from '../../../dto/role/create-user-role.dto';
import { UpdateGroupDto } from '../../../dto/role/update-user-role.dto';

/**
 * User groups controllers
 * @author MvThang
 */
@Controller('/be/v1/user-groups')
export class RoleController extends BaseController {
  constructor(private readonly service: RoleService) {
    super();
  }

  @Post()
  async createGroup(@Res() res: Response, @Body() data: CreateGroupDto) {
    await this.service.createGroup(data);
    return this.responseSuccess(res);
  }

  @Put('/:id')
  async updateGroup(
    @Param('id') id: number,
    @Res() res: Response,
    @Body() data: UpdateGroupDto,
  ): Promise<IResponse> {
    await this.service.updateGroup(id, data);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get('/:id')
  async getGroupById(
    @Res() res: Response,
    @Param('id') id: number,
    @Query() params,
  ) {
    const result = await this.service.getGroupById(params, id);
    return this.responseSuccess(res, result);
  }

  @Get()
  async getGroupList(@Res() res: Response, @Query() params) {
    const result = await this.service.getGroupList(params);
    return this.responseSuccess(res, result);
  }

  /**
   * Create a record in ddv_roles and ddv_usergroup_description
   * @param data type : string, usergroup : string, company_id : number, lang_code : string
   * @param res
   * @returns
   */
  @Post()
  //@UseGuards(AuthGuard)
  async create(
    @Body() data: CreateUserGroupsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.create(data);
    return this.responseSuccess(res, result);
  }

  @Get()
  @UseGuards(AuthGuard)
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
  //@UseGuards(AuthGuard)
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
  // @UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body() data: UpdateUserGroupsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.update(id, data);
    return this.responseSuccess(res, result, 'Cập nhật thành công.');
  }
}
