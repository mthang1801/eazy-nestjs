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
import { UserProfileDto } from '../../dto/user/update-userProfile.dto';
import { UsersService } from '../../services/users.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/fe.auth';

@Controller('/fe/v1/users')
export class UsersController extends BaseController {
  constructor(private readonly service: UsersService) {
    super();
  }
  /**
   *
   * @param userUpdateDto
   * @param req
   * @param res
   * @returns
   */
  //@UseGuards(AuthGuard)
  @Put()
  async update(
    @Body() userUpdateDto: UserUpdateDto,
    @Req() req,
    @Res() res,
  ): Promise<IResponse> {
    const { user_id } = req.user;
    const updatedUser = await this.service.update(user_id, userUpdateDto);

    return this.responseSuccess(res, updatedUser);
  }

  /**
   * get my profile
   * @param req
   * @param res
   * @returns
   */
  @Get()
  //@UseGuards(AuthGuard)
  async getInfo(@Req() req, @Res() res): Promise<IResponse> {
    const user = await this.service.getInfo(req.user.user_id);
    return this.responseSuccess(res, user);
  }

  @Get(':id')
  async getUserById(@Req() req, @Res() res): Promise<IResponse> {
    const user = await this.service.getById(req.params.id);
    return this.responseSuccess(res, { userData: user });
  }

  @Put('/update-user-profile')
  //@UseGuards(AuthGuard)
  async updateUserProfile(
    @Body() userProfileDto: UserProfileDto,
    @Req() req,
    @Res() res,
  ): Promise<IResponse> {
    const updatedUserProfile = await this.service.updateProfile(
      req.user.user_id,
      userProfileDto,
    );
    return this.responseSuccess(res, { userProfile: updatedUserProfile });
  }
}
