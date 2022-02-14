import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { UserUpdateDto } from '../../dto/user/update-user.dto';
import { UsersService } from '../../services/users.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/be.auth';
@Controller('/be/v1/users')
export class UsersController extends BaseController {
  constructor(private readonly service: UsersService) {
    super();
  }

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

  @Get('/find/:id')
  async getById(@Req() req, @Res() res): Promise<IResponse> {
    const user = await this.service.getById(req.params.id);
    return this.responseSuccess(res, { userData: user });
  }
}
