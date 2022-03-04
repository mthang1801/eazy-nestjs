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
} from '@nestjs/common';
import { UserUpdateDto } from '../../dto/user/update-user.dto';
import { UsersService } from '../../services/users.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';
import { UpdateUserGroupsDto } from 'src/app/dto/usergroups/update-usergroups.dto';
import { Response } from 'express';
import { UpdateUserProfileDto } from '../../dto/user/update-userProfile.dto';
@Controller('/be/v1/users')
export class UsersController extends BaseController {
  constructor(private readonly service: UsersService) {
    super();
  }

  @Get()
  //@UseGuards(AuthGuard)
  async getMyInfo(@Req() req, @Res() res): Promise<IResponse> {
    const user = await this.service.getInfo(req.user.user_id);
    return this.responseSuccess(res, user);
  }
  @Get('/otp')
  async otp_demo(@Req() req, @Res() res): Promise<void> {
    res.render('otp-auth');
  }

  @Get('/:id')
  async getById(
    @Param('id') id: number,

    @Res() res,
  ): Promise<IResponse> {
    const result = await this.service.getById(id);
    return this.responseSuccess(res, result);
  }

  @Put('/profile/:id')
  async updateProfile(
    @Param('id') id: number,
    @Body() data: UpdateUserProfileDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.updateProfile(id, data);
    return this.responseSuccess(res, '', 'Cập nhật thành công.');
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body() data,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.update(id, data);
    return this.responseSuccess(res, result);
  }
}
