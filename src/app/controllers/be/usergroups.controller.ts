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
} from '@nestjs/common';

import { UserGroupsService } from '../../services/usergroups.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';
import { Response } from 'express';
import { CreateUserGroupsDto } from 'src/app/dto/usergroups/create-usergroups.dto';
import { UpdateUserGroupsDto } from 'src/app/dto/usergroups/update-usergroups.dto';

/**
 * User groups controllers
 * @author MvThang
 */
@Controller('/be/v1/usergroups')
export class UsergroupsController extends BaseController {
  constructor(private readonly service: UserGroupsService) {
    super();
  }

  /**
   * Create a record in ddv_usergroups and ddv_usergroup_description
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

  /**
   * get All User, using query params to filter such as page, limit, status, lang_code, type...
   * @param res
   * @param params
   * @returns
   */
  @Get('users')
  //@UseGuards(AuthGuard)
  async getUserLists(
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getUserLists(params);
    return this.responseSuccess(res, result);
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(res);
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
  //@UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body() data: UpdateUserGroupsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.update(id, data);
    return this.responseSuccess(res, result);
  }
}
