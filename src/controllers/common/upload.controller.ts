import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';

import * as multer from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { UploadFileDto } from '../../dto/upload/upload.dto';
import { BaseController } from '../../base/base.controllers';
import { UploadService } from '../../services/upload.services';
import { IResponse } from 'src/base/interfaces/response.interface';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('uploads')
@ApiTags('Uploads')
export class UploadController extends BaseController {
  constructor(private service: UploadService) {
    super();
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadFileDto,
    description: 'Upload List of files to CDN',
  })
  @ApiResponse({ status: 201, description: 'Upload successfully' })
  @ApiResponse({ status: 413, description: 'File too large' })
  @ApiResponse({ status: 500, description: 'Internal Server' })
  @ApiResponse({ status: 504, description: 'Request Timeout' })
  @Version(VERSION_NEUTRAL)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, './uploads'),
        filename: (req, file, cb) => {
          const filename = `${Date.now()}_${file.originalname}`;
          return cb(null, filename);
        },
      }),
    }),
  )
  async uploadFiles(
    @Body() data: UploadFileDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res: Response,
  ): Promise<IResponse> {
    console.log(data);
    const result = await this.service.uploadFiles(data, files);
    return this.responseCreated(res, result);
  }

  @Version('1')
  @Get()
  async getFile(
    @Res() res: Response,
    @Query('q') q: string,
  ): Promise<IResponse> {
    const result = await this.service.getFile(q);
    return this.responseSuccess(res, result);
  }
}
