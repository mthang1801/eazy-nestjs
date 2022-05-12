import {
  Controller,
  UseGuards,
  Param,
  Body,
  Res,
  Put,
  Query,
} from '@nestjs/common';
import { UpdateUserGroupsDto } from 'src/app/dto/usergroups/update-usergroups.dto';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { UserSystemService } from '../../../services/userSystem.service';
import { Get, Post } from '@nestjs/common';
import { UpdateUserSystemDto } from 'src/app/dto/userSystem/update-userSystem.dto';
import { CreateUserSystemDto } from 'src/app/dto/userSystem/create-userSystem.dto';
import { UpdateUserSystemRoleFunctsDto } from '../../../dto/userSystem/update-userSystemRoleFuncts.dto';

@Controller('/be/v1/user-system')
export class UserSystemController extends BaseController {
  constructor(private service: UserSystemService) {
    super();
  }

  /**
   * get All User, using query params to filter such as page, limit, status, lang_code, type...
   * @param res
   * @param params
   * @returns
   */
  @Get()
  // @UseGuards(AuthGuard)
  async getUserLists(
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getUserLists(params);
    return this.responseSuccess(res, result);
  }

  @Get(':user_id')
  //@UseGuards(AuthGuard)
  async get(
    @Param('user_id') user_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getById(user_id);
    return this.responseSuccess(res, result);
  }

  @Put(':user_id')
  // @UseGuards(AuthGuard)
  async update(
    @Param('user_id') user_id: number,
    @Body() data: UpdateUserSystemDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.update(user_id, data);
    return this.responseSuccess(res, result);
  }

  @Post()
  async create(
    @Body() data: CreateUserSystemDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.create(data);
    return this.responseSuccess(res);
  }

  @Put(':user_id/change-roles')
  async changeRoleFuncts(
    @Param('user_id') user_id: number,
    @Body() data: UpdateUserSystemRoleFunctsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.changeRoleFuncts(user_id, data);
    return this.responseSuccess(res);
  }
}
