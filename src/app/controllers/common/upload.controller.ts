import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import * as multer from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/app/services/upload.service';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { IResponse } from 'src/app/interfaces/response.interface';

@Controller('/uploads')
export class UploadController extends BaseController {
  constructor(private service: UploadService) {
    super();
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, './uploads'),
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
            file.originalname
          }`;
          return cb(null, filename);
        },
      }),
      limits: { fileSize: 50000 },
    }),
  )
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.upload(files);
    return this.responseSuccess(res, result, 'Thành công.');
  }
}
