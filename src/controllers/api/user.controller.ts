import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Post,
  Query,
  Res,
  Version,
} from '@nestjs/common';
import { BaseController } from '../../base/base.controllers';
import { Response } from 'express';
import { IResponse } from 'src/base/interfaces/response.interface';
import { CreateUserDto } from '../../dto/user/createUser.dto';
import { UserService } from '../../services/user.service';

@Controller('api/users')
export class UserController extends BaseController {
  constructor(private service: UserService) {
    super();
  }
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

  @Get('get-all')
  async getUser(@Res() res: Response): Promise<IResponse> {
    await this.service.getUser();
    return this.responseSuccess(res);
  }

  @Post('tracking-rollback')
  async createTest(@Res() res: Response, @Body() data): Promise<IResponse> {
    await this.service.create(data);
    return this.responseCreated(res);
  }

  @Post('test-condition')
  async testCondition(@Res() res: Response, @Body() data): Promise<IResponse> {
    await this.service.testCondition(data);
    return this.responseCreated(res);
  }
}
