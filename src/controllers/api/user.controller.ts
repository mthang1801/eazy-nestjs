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
import { RolesEnum } from '../../enums/role.enum';
import {
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginatedDto, PagingDto } from '../../dto/genneric/paginated.dto';
import { UserEntity } from '../../entities/user.entity';
import { ApiHeaders, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/swagger/apiPaginatedResponse.swagger';

@Controller('api/users')
@ApiTags('User Management')
@ApiHeaders([
  { name: 'x-auth-uuid', description: 'Auth UUID' },
  { name: 'Authorization', description: 'Auth Bearer' },
])
export class UserController extends BaseController {
  constructor(private service: UserService) {
    super();
  }
  /**
   * Get List Users version 1
   * @param res {Response}
   * @returns
   */

  @Version('2')
  @Get()
  @ApiPaginatedResponse(UserEntity)
  @ApiConsumes('application/json')
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'roles', enum: RolesEnum, isArray: true })
  async getListVersion2(
    @Res() res: Response,
    @Query('roles', new ParseArrayPipe({ items: String, separator: ',' }))
    roles: RolesEnum,
  ): Promise<IResponse> {
    // Do something
    let data = null;
    let message = 'This action return User version 2';
    return this.responseSuccess(res, data, message);
  }

  /**
   * Create user
   * @param res
   * @param data {CreateUserDto}
   * @returns
   */
  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbiden' })
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
