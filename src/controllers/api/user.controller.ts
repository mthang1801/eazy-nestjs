import { Body, Controller, Get, Post, Res, Version } from '@nestjs/common';
import { BaseController } from '../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/base/interfaces/response.interface';
import { CreateUserDto } from '../../dto/user/createUser.dto';

@Controller('users')
export class UserController extends BaseController {
  /**
   * Get List Users version 1
   * @param res {Response}
   * @returns
   */

  @Version('1')
  @Get()
  async getListVersion1(@Res() res: Response): Promise<IResponse> {
    // Do something
    let data = null;
    let message = 'This action return User version 1';
    return this.responseSuccess(res, data, message);
  }

  @Version('2')
  @Get()
  async getListVersion2(@Res() res: Response): Promise<IResponse> {
    // Do something
    let data = null;
    let message = 'This action return User version 2';
    return this.responseSuccess(res, data, message);
  }

  @Version(['3', '4'])
  @Get()
  async getListVersion1Or2(@Res() res: Response): Promise<IResponse> {
    // Do something
    let data = null;
    let message = 'This action return User version 3 or 4';
    return this.responseSuccess(res, data, message);
  }

  /**
   * Get User By user_id
   * @param res {Response}
   * @returns
   */
  @Get(':user_id')
  async getById(@Res() res: Response): Promise<IResponse> {
    //Do something
    return this.responseSuccess(res);
  }

  /**
   * Create user
   * @param res
   * @param data {CreateUserDto}
   * @returns
   */
  @Post()
  async create(
    @Res() res: Response,
    @Body() data: CreateUserDto,
  ): Promise<IResponse> {
    //Do something
    return this.responseCreated(res);
  }
}
