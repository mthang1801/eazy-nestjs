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
import {
  CreateUserGroupsDto,
  CreateUserGroupDescriptionDto,
  CreateUserGroupLinkDto,
} from '../../dto/usergroups/create-usergroups.dto';
import { UserGroupsService } from '../../services/user_groups.service';
import { BaseController } from '../../../base/base.controllers';
import { IUser } from '../../interfaces/users.interface';
import { IResponse } from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';
import { Roles } from 'src/app/helpers/decorators/roles.decorator';
import { Response } from 'express';
import {
  UpdateUserGroupsDto,
  UpdateUserGroupDescriptionDto,
} from '../../dto/usergroups/update-usergroups.dto';
import { get } from 'http';

/**
 * User groups controllers
 * @author khoa.nt
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
  async createUserGroup(
    @Body() data: CreateUserGroupsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroup = await this.usersGroupService.createUserGroup(data);
    return this.respondCreated(res, newUserGroup);
  }

  /**
   * find a record by usergroup_id in ddv_usergroups join ddv_usergroup_descriptions join ddv_usergroup_privilege
   * @param usergroup_id
   * @param res
   * @returns
   */
  @Get('/search/:usergroup_id')
  @UseGuards(AuthGuard)
  async getUserGroup(
    @Param('usergroup_id') usergroup_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const userGroup = await this.usersGroupService.getUserGroup(usergroup_id);
    return this.responseSuccess(res, userGroup);
  }

  /**
   * Fetch list usergroups in ddv_usergroups join ddv_usergroup_descriptions join ddv_usergroup_privilege
   * @param skip
   * @param limit
   * @param res
   * @returns
   */
  @Get()
  @UseGuards(AuthGuard)
  async fetchUserGroups(
    @Query('skip') skip: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const userGroups = await this.usersGroupService.fetchUserGroups(
      skip,
      limit,
    );
    return this.responseSuccess(res, userGroups);
  }

  /**
   * Update a record by usergroup_id in ddv_usergroups join ddv_usergroup_descriptions join ddv_usergroup_privilege
   * @param data
   * @param res
   * @returns
   */
  @Put()
  @UseGuards(AuthGuard)
  async updateUserGroup(
    @Body() data: UpdateUserGroupsDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const updatedUserGroup = await this.usersGroupService.updateUserGroup(data);
    return updatedUserGroup
      ? this.responseSuccess(
          res,
          updatedUserGroup,

          'Cập nhật thành công.',
        )
      : this.respondNotFound(
          res,
          'Cập nhật thất bại, không tìm thấy usergroup_id phù hợp',
        );
  }

  /**
   * Delete a record by usergroup_id in ddv_usergroups
   * @param usergroup_id
   * @param res
   * @returns
   */
  @Delete('/delete/:usergroup_id')
  @UseGuards(AuthGuard)
  async deleteUserGroup(
    @Param('usergroup_id') usergroup_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const resStatus = await this.usersGroupService.deleteUserGroup(
      usergroup_id,
    );
    return resStatus
      ? this.responseSuccess(
          res,
          null,
          `Xoá usergroup_id ${usergroup_id} thành công.`,
        )
      : this.respondNotFound(
          res,
          `Xoá usergroup_id ${usergroup_id} không thành công.`,
        );
  }

  /**
   * Create new description for usergroup in ddv_usergroup_descriptions
   * @param data
   * @param res
   * @returns
   */
  @Post('/description')
  @UseGuards(AuthGuard)
  async createUserGroupDescription(
    @Body() data: CreateUserGroupDescriptionDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroupDesc =
      await this.usersGroupService.createUserGroupDescription(data);
    return this.respondCreated(res, newUserGroupDesc);
  }

  /**
   * Get usergroup description item by usergroup_id in ddv_usergroup_descriptions
   * @param usergroup_id
   * @param res
   * @returns
   */
  @Get('/description/search/:usergroup_id')
  async getUserGroupDesciption(
    @Param('usergroup_id') usergroup_id: number,
    @Res() res,
  ): Promise<IResponse> {
    const userGroupDesc = await this.usersGroupService.getUserGroupDesciption(
      usergroup_id,
    );
    return this.responseSuccess(res, userGroupDesc);
  }

  /**
   * Update user group description in ddv_usergroup_descriptions
   * @param data
   * @param res
   * @returns
   */
  @Put('/description')
  @UseGuards(AuthGuard)
  async updateUserGroupDescription(
    @Body() data: UpdateUserGroupDescriptionDto,
    @Res() res,
  ): Promise<IResponse> {
    const updatedUsertGroupDesc =
      await this.usersGroupService.updateUserGroupDescription(data);
    return this.responseSuccess(
      res,
      updatedUsertGroupDesc,
      'Cập nhật thành công.',
    );
  }

  /**
   * Delete usergroup description in ddv_usergroup_descriptions
   * @param usergroup_id
   * @param res
   * @returns
   */
  @Delete('description/delete/:usergroup_id')
  @UseGuards(AuthGuard)
  async deleteUserGroupDescription(
    @Param('usergroup_id') usergroup_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const boolRes = await this.usersGroupService.deleteUserGroupDescription(
      usergroup_id,
    );
    return boolRes
      ? this.responseSuccessNoContent(res)
      : this.respondNotFound(
          res,
          `Xoá user group description với usergroup_id ${usergroup_id} không thành công.`,
        );
  }

  /**
   *  Create new link for user_id into usergroup in ddv_usergroup_links
   * @param data
   * @param res
   * @returns
   */
  @Post('link')
  @UseGuards(AuthGuard)
  async createUserGroupLink(
    @Body() data: CreateUserGroupLinkDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const newUserGroupLink = await this.usersGroupService.createUserGroupLink(
      data,
    );
    return this.respondCreated(res, newUserGroupLink);
  }

  /**
   * Get user info including : user_info, usergroup_links, usergroup_privilege
   * @param user_id
   * @param res
   * @returns
   */
  @Get('link/user/:user_id')
  async getUserInUserGroupLink(
    @Param('user_id') user_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const user = await this.usersGroupService.getUserInUserGroupLink(user_id);
    return this.responseSuccess(res, user);
  }

  @Get('/link/usergroup/:usergroup_id')
  async getUsersByUserGroupInUserGroupLink(
    @Param('usergroup_id') usergroup_id: number,
    @Query('skip') skip: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const users =
      await this.usersGroupService.getUsersByUserGroupInUserGroupLink(
        usergroup_id,
        skip,
        limit,
      );
    return this.responseSuccess(res, users);
  }
}
