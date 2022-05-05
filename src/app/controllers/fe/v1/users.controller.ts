import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { UserUpdateDto } from '../../../dto/user/update-user.dto';
import { UpdateUserProfileDto } from '../../../dto/user/update-userProfile.dto';
import { UsersService } from '../../../services/users.service';
import { BaseController } from '../../../../base/base.controllers';
import { IResponse } from '../../../interfaces/response.interface';
import { AuthGuard } from '../../../../middlewares/fe.auth';
import { Param, Query, Inject, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import { CustomerService } from '../../../services/customer.service';
import { OrdersService } from '../../../services/orders.service';
@Controller('/fe/v1/users')
export class UsersController extends BaseController {
  constructor(private readonly service: UsersService) {
    super();
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

  @Put('/profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Req() req,
    @Body() data: UpdateUserProfileDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    let { user_id } = req.user;
    await this.service.updateProfile(user_id, data);
    return this.responseSuccess(res);
  }

  @Get(':user_id/loyal-histories')
  async getLoyalHistories(
    @Query() params,
    @Param('user_id') user_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getLoyalHistories(user_id, params);
    return this.responseSuccess(res, result);
  }

  @Get('/:user_id/orders')
  async getOrdersList(
    @Param('user_id') user_id: number,
    @Res() res: Response,
    @Query() params,
  ) {
    const result = await this.service.getOrdersByUserId(user_id, params);
    return this.responseSuccess(res, result);
  }
}
