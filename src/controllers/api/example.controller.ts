import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseFilters,
  Version,
} from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiHeaders,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { I18n, I18nContext, I18nValidationExceptionFilter } from 'nestjs-i18n';
import { BaseController } from 'src/base/base.controllers';
import { IResponse } from 'src/base/interfaces/response.interface';
import { CreateExampleDto } from '../../dto/example/create-example.dto';
import { ExampleService } from '../../services/example.service';
import { ExampleEntity } from '../../entities/example.entity';
import { getSchemaPath } from '@nestjs/swagger';
import { PaginatedDto } from '../../dto/paging/page.dto';
import { PagingDto } from '../../dto/genneric/paginated.dto';
import { ApiPaginatedResponse } from 'src/swagger/helper';

@Controller('examples')
@ApiTags('Examples')
@ApiHeaders([
  {
    name: 'Accept-Language',
    description: 'Using multiple languages',
    enum: ['vi', 'en', 'fr'],
  },
  {
    name: 'Authorization',
    description: 'Access Token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },
  {
    name: 'Content-Type',
    example: 'application/json',
  },
])
export class ExampleController extends BaseController {
  constructor(private service: ExampleService) {
    super();
  }
  @Version('1')
  @ApiBody({ type: CreateExampleDto, description: 'Create An Example' })
  @ApiCreatedResponse({
    type: ExampleEntity,
    description: 'The record has been successfully created.',
  })
  @ApiBadRequestResponse({ description: 'The input data is not correct' })
  @ApiOperation({ summary: 'Create An Example' })
  @Post()
  async createExample(
    @Res() res: Response,
    @Body() data: CreateExampleDto,
  ): Promise<IResponse> {
    await this.service.createExample();
    return this.responseCreated(res);
  }

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'Get List Examples Version 1' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ExampleEntity) },
            },
          },
        },
      ],
    },
    description: 'Return list of examples with data by page, limit, q ',
  })
  async getList(
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ): Promise<IResponse> {
    let data = null;
    // let msg = 'This is Get List Examples Version 1';
    let msg = i18n.t('example.day_interval', { args: { count: 1 } });
    return this.responseSuccess(res, data, msg);
  }

  @Version('2')
  @ApiOperation({ summary: 'Get List Examples Version 2' })
  @ApiPaginatedResponse(ExampleEntity)
  @Get()
  async getListV2(@Res() res: Response): Promise<IResponse> {
    let data = null;
    let msg = 'This is Get List Examples Version 2';
    return this.responseSuccess(res, data, msg);
  }

  @Version('1')
  @ApiOkResponse({
    type: ExampleEntity,
    description: 'Response example by id ',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server' })
  @ApiOperation({ summary: 'Get An Example By Id' })
  @Get(':id')
  async getById(@Res() res: Response): Promise<IResponse> {
    let data = null;
    let msg = 'This is Get List Examples Version 2';
    return this.responseSuccess(res, data, msg);
  }

  @Version('1')
  @Post('send-mail')
  async sendMail(
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ): Promise<IResponse> {
    await this.service.sendMail(i18n.lang);
    return this.responseCreated(res);
  }
}
