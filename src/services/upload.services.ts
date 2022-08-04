import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fsExtra from 'fs-extra';
import { UploadFileDto } from '../dto/upload/upload.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {}
  async uploadFiles(data: UploadFileDto, files: Array<Express.Multer.File>) {
    if (!files.length) return;
    let formData: any = new FormData();
    for (let file of files) {
      formData.append('files', await fsExtra.createReadStream(file.path));
    }
    formData.append('object', data.object);
    formData.append('object_id', data.object_id);
    if (data.object_type) {
      formData.append('object_type', data.object_type);
    }

    let config: any = {
      method: 'post',
      url: this.config.get<string>('uploadAPI'),
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
        ['auth-uuid']: this.config.get<string>('cdnSecurityUploadUrl'),
      },
      data: formData,
    };

    try {
      const response: any = await axios(config);

      if (!response?.data) {
        throw new HttpException(
          'Upload không thành công, CDN không phản hồi',
          500,
        );
      }
      let result = response.data.data.map((data) => data);

      for (let file of files) {
        fsExtra.unlink(file.path);
      }

      return result;
    } catch (error) {
      for (let file of files) {
        fsExtra.unlink(file.path);
      }
      console.log(error?.response);
      if (error?.response?.status == 413) {
        throw new HttpException(
          'Upload không thành công, kích thước file quá lớn.',
          413,
        );
      }
      throw new HttpException(
        `Có lỗi xảy ra : ${
          error?.response?.data?.message ||
          error?.response?.data ||
          error.message
        }`,
        error?.response?.status || error.status,
      );
    }
  }

  async getFile(q: string) {
    return `${this.config.get<string>('cdnUrl')}/${q}`;
  }
}
