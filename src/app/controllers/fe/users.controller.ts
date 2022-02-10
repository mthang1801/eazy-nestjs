import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { UserUpdateDto } from '../../dto/user/update-user.dto';
import { UserProfileDto } from '../../dto/user/update-user-profile.dto';
import { UsersService } from '../../services/users.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/fe.auth';

@Controller('/fe/v1/users')
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }
  @UseGuards(AuthGuard)
  @Put()
  async updateUserInfo(
    @Body() userUpdateDto: UserUpdateDto,
    @Req() req,
    @Res() res,
  ): Promise<IResponse> {
    const { user_id } = req.user;
    const updatedUser = await this.usersService.updateUser(
      user_id,
      userUpdateDto,
    );

    return this.responseSuccess(res, updatedUser);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getMyInfo(@Req() req, @Res() res): Promise<IResponse> {
    const user = await this.usersService.getMyInfo(req.user.user_id);
    return this.responseSuccess(res, user);
  }
  @Get('/otp')
  async otp_demo(@Req() req, @Res() res): Promise<void> {
    res.render('otp-auth');
  }
  @Get('find/:id')
  async getUserById(@Req() req, @Res() res): Promise<IResponse> {
    const user = await this.usersService.findById(req.params.id);
    return this.responseSuccess(res, { userData: user });
  }

  @Put('/update-user-profile')
  @UseGuards(AuthGuard)
  async updateUserProfile(
    @Body() userProfileDto: UserProfileDto,
    @Req() req,
    @Res() res,
  ): Promise<IResponse> {
    const updatedUserProfile = await this.usersService.updateProfile(
      req.user.user_id,
      userProfileDto,
    );
    return this.responseSuccess(res, { userProfile: updatedUserProfile });
  }
}
