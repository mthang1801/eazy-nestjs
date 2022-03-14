import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { BannerEntity } from '../entities/banner.entity';
import { BannerRepository } from '../repositories/banner.repository';

import { ImagesService } from './image.service';
import { Table, JoinTable, SortBy } from '../../database/enums/index';
import { convertToMySQLDateTime } from 'src/utils/helper';
import { BannerDescriptionsRepository } from '../repositories/bannerDescription.respository';
import { BannerDescriptionsEntity } from '../entities/bannerDescriptions.entity';
import { Like } from 'typeorm';
import { createBannerImageDTO } from '../dto/banner/create-banner-image.dto';
import { IBannerResult } from '../interfaces/bannerResult.interface';
import { CreateBannerDto } from '../dto/banner/create-banner.dto';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import axios from 'axios';
import * as FormData from 'form-data';
import { ImageObjectType } from 'src/database/enums/tableFieldTypeStatus.enum';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { UpdateBannerDTO } from '../dto/banner/update-banner.dto';
import { BannerImagesEntity } from '../entities/bannerImages.entity';
import { BannerLocationDescriptionRepository } from '../repositories/bannerLocationDescription.repository';
import { BannerLocationDescriptionEntity } from '../entities/bannerLocationDescription.entity';
@Injectable()
export class bannerService {
  constructor(
    private bannerRepo: BannerRepository<BannerEntity>,
    private bannerDescriptionRepo: BannerDescriptionsRepository<BannerDescriptionsEntity>,
    private imageService: ImagesService,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private bannerLocationsDescRepo: BannerLocationDescriptionRepository<BannerLocationDescriptionEntity>,
  ) {}
  async getList(params): Promise<IBannerResult[]> {
    //=====Filter param
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.bannerRepo.tableProps.includes(key)) {
          filterCondition[`${Table.BANNER}.${key}`] = Like(val);
        } else {
          filterCondition[`${Table.BANNER_DESCRIPTIONS}.${key}`] = Like(val);
        }
      }
    }
    //===
    const banner = this.bannerRepo.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_banner_descriptions: {
            fieldJoin: 'banner_id',
            rootJoin: 'banner_id',
          },
        },
      },

      skip: skip,
      limit: limit,
    });
    const images = this.imageService.GetImage();

    const result = await Promise.all([images, banner]);
    let _banner = [];
    result[1].forEach((ele) => {
      _banner.push({
        ...ele,
        images: result[0].filter(
          (img) =>
            img.object_id == ele.banner_id && img.object_type == 'banners',
        ),
      });
    });
    return _banner;
  }

  async getLocationsList() {
    return this.bannerLocationsDescRepo.find();
  }

  async getById(id): Promise<IBannerResult> {
    const string = `${Table.BANNER}.banner_id`;
    const banner = this.bannerRepo.findOne({
      select: ['*'],
      where: { [string]: id },
      join: {
        [JoinTable.join]: {
          [Table.BANNER_DESCRIPTIONS]: {
            fieldJoin: 'banner_id',
            rootJoin: 'banner_id',
          },
        },
      },

      skip: 0,
      limit: 30,
    });

    const images = this.imageService.GetImageById(id);

    const result = await Promise.all([images, banner]);

    return { ...result[1], images: result[0] };
  }

  async create(data: CreateBannerDto) {
    for (let locationId of data.location_ids) {
      const bannerData = {
        ...new BannerEntity(),
        ...this.bannerRepo.setData(data),
        location_id: locationId,
      };

      const banner = await this.bannerRepo.create(bannerData);

      let result = { ...banner };

      const bannerDescData = {
        ...new BannerDescriptionsEntity(),
        ...this.bannerDescriptionRepo.setData(data),
        banner_id: result.banner_id,
      };

      const bannerDesc = await this.bannerDescriptionRepo.create(
        bannerDescData,
      );

      result = { ...result, ...bannerDesc };

      const bannerImageData = {
        ...new ImagesEntity(),
        ...this.imageRepo.setData(data),
      };
      const bannerImage = await this.imageRepo.create(bannerImageData);

      result = { ...result, image: { ...bannerImage } };

      const bannerImageLinkData = {
        ...new ImagesLinksEntity(),
        ...this.imageLinkRepo.setData(data),
        object_id: result.banner_id,
        object_type: ImageObjectType.BANNER,
        image_id: bannerImage.image_id,
      };

      const bannerImageLink = await this.imageLinkRepo.create(
        bannerImageLinkData,
      );

      result = { ...result, image: { ...result.image, ...bannerImageLink } };
    }
  }

  async update(id: number, data: UpdateBannerDTO): Promise<any> {
    const banner = await this.bannerRepo.findById(id);
    if (!banner) {
      throw new HttpException('Không tìm thấy banner.', 404);
    }
    let result: any = { ...banner };

    const bannerData = this.bannerRepo.setData(data);
    if (Object.entries(bannerData).length) {
      const updatedBanner = await this.bannerRepo.update(
        { banner_id: id },
        bannerData,
      );
      result = { ...result, ...updatedBanner };
    }

    const bannerDescData = this.bannerDescriptionRepo.setData(data);
    if (Object.entries(bannerDescData).length) {
      const updatedBannerDesc = await this.bannerDescriptionRepo.update(
        { banner_id: id },
        bannerDescData,
      );
      result = { ...result, ...updatedBannerDesc };
    }

    if (data.image_path) {
      const oldImageLink = await this.bannerRepo.findOne({
        object_type: ImageObjectType.BANNER,
        object_id: result.banner_id,
      });
      if (oldImageLink) {
        const imageLinkData = this.imageLinkRepo.setData(data);
        if (Object.entries(imageLinkData).length) {
          const updatedImageLink = await this.imageLinkRepo.update(
            { pair_id: oldImageLink.pair_id },
            imageLinkData,
          );
          result = {
            ...result,
            image: { ...oldImageLink, ...updatedImageLink },
          };
        }

        const imageData = this.imageRepo.setData(data);
        if (Object.entries(imageData).length) {
          const updatedImage = await this.imageRepo.update(
            { image_id: oldImageLink.image_id },
            imageData,
          );
          result = { ...result, image: { ...result.image, ...updatedImage } };
        }
      }
    }

    return result;
  }

  async Delete(banner_id, images_id): Promise<void> {
    await this.imageService.Delete(banner_id, images_id);
  }
  async createBannerImage(data: createBannerImageDTO, id): Promise<any> {
    return this.imageService.Create(data, id);
  }

  async getAllIamgesByBannerId(id): Promise<any> {
    return this.imageService.getAllIamgesByBannerId(id);
  }
  async updateBannerById(banner_id, images_id, body): Promise<any> {
    return this.imageService.Update(body, banner_id, images_id);
  }

  async uploadImages(images) {
    let data = new FormData();
    for (let image of images) {
      data.append('files', fs.createReadStream(image.path));
    }

    var config: any = {
      method: 'post',
      url: 'http://mb.viendidong.com/core-api/v1/files/website',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...data.getHeaders(),
      },
      data: data,
    };

    const response = await axios(config);

    for (let image of images) {
      await fsExtra.unlink(image.path);
    }

    const results = response?.data?.data;

    return { image_path: results[0] };
  }
}
