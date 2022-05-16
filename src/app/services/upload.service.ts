import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import { UPLOAD_IMAGE_API } from 'src/constants/api.appcore';
@Injectable()
export class UploadService {
  async upload(files) {
    if (!files?.length) return;

    let data = new FormData();
    for (let file of files) {
      data.append('files', fs.createReadStream(file.path));
    }

    let config: any = {
      method: 'post',
      url: UPLOAD_IMAGE_API,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...data.getHeaders(),
      },
      data: data,
    };

    try {
      const response = await axios(config);

      const results = response?.data?.data;
      for (let file of files) {
        await fsExtra.unlink(file.path);
      }

      return results;
    } catch (error) {
      for (let file of files) {
        await fsExtra.unlink(file.path);
      }
      throw new HttpException(
        `Có lỗi xảy ra : ${
          error?.response?.data?.message ||
          error?.response?.data ||
          error.message
        }`,
        error.response.status,
      );
    }
  }
}
