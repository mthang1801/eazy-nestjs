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
import { BannerTargetDescriptionRepository } from '../repositories/bannerTargetDescription.repository copy';
import { BannerTargetDescriptionEntity } from '../entities/bannerTargetDescription.entity';
import { bannerSearchFilter } from '../../utils/tableConditioner';
import { bannerJoiner } from 'src/utils/joinTable';
import { Like } from 'src/database/find-options/operators';
import { UPLOAD_IMAGE_API } from 'src/database/constant/api';

@Injectable()
export class bannerService {
  constructor(
    private bannerRepo: BannerRepository<BannerEntity>,
    private bannerDescriptionRepo: BannerDescriptionsRepository<BannerDescriptionsEntity>,
    private imageService: ImagesService,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private bannerLocationsDescRepo: BannerLocationDescriptionRepository<BannerLocationDescriptionEntity>,
    private bannerTargetDescRepo: BannerTargetDescriptionRepository<BannerTargetDescriptionEntity>,
  ) {}
  async getList(params) {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.bannerRepo.tableProps.includes(key)) {
          filterCondition[`${Table.BANNER}.${key}`] = Like(val);
        } else {
          filterCondition[`${Table.BANNER_DESCRIPTIONS}.${key}`] = Like(val);
        }
      }
    }

    const banners = await this.bannerRepo.find({
      select: '*',
      join: bannerJoiner,
      orderBy: [{ field: 'updated_at', sortBy: SortBy.DESC }],
      where: bannerSearchFilter(search, filterCondition),
      skip,
      limit,
    });

    const count = await this.bannerRepo.find({
      select: `COUNT(DISTINCT(${Table.BANNER}.banner_id)) as total`,
      join: bannerJoiner,
      where: bannerSearchFilter(search, filterCondition),
    });

    for (let bannerItem of banners) {
      let bannerImage = await this.imageLinkRepo.findOne({
        object_id: bannerItem.banner_id,
        object_type: ImageObjectType.BANNER,
      });
      if (bannerImage) {
        const image = await this.imageRepo.findById(bannerImage.image_id);
        bannerItem['image'] = { ...bannerImage, ...image };
      }
    }

    return {
      banners,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : banners.length,
      },
    };
  }

  async getListByTarget(target_id) {
    const banners = await this.bannerRepo.find({
      select: '*',
      join: bannerJoiner,
      where: { [`${Table.BANNER}.target_id`]: target_id },
    });

    let bannerLocations = {};
    if (banners.length) {
      for (let bannerItem of banners) {
        bannerItem['image'] = null;
        const bannerImageLink = await this.imageLinkRepo.findOne({
          object_type: ImageObjectType.BANNER,
          object_id: bannerItem.banner_id,
        });
        if (bannerImageLink) {
          const bannerImage = await this.imageRepo.findOne({
            image_id: bannerImageLink.image_id,
          });
          bannerItem['image'] = { ...bannerImageLink, ...bannerImage };
        }

        bannerLocations[bannerItem['location_description']] = bannerLocations[
          bannerItem['location_description']
        ]
          ? [...bannerLocations[bannerItem['location_description']], bannerItem]
          : [bannerItem];
      }
      return bannerLocations;
    }
    return banners;
  }

  async getLocationsList() {
    return this.bannerLocationsDescRepo.find();
  }

  async getTargetsList() {
    return this.bannerTargetDescRepo.find();
  }

  async getById(id: number) {
    const banner = await this.bannerRepo.findOne({
      select: ['*'],
      join: bannerJoiner,
      where: { [`${Table.BANNER}.banner_id`]: id },
    });

    const bannerImageLink = await this.imageLinkRepo.findOne({
      object_id: banner.banner_id,
      object_type: ImageObjectType.BANNER,
    });
    if (bannerImageLink) {
      const bannerImage = await this.imageRepo.findById({
        image_id: bannerImageLink.image_id,
      });
      banner['image'] = bannerImage;
    }
    return banner;
  }

  async create(data: CreateBannerDto) {
    let results = [];
    for (let { target_id, location_id } of data.displays) {
      const bannerData = {
        ...new BannerEntity(),
        ...this.bannerRepo.setData(data),
        target_id,
        location_id,
      };

      const banner = await this.bannerRepo.create(bannerData);

      let result = { ...banner };

      const bannerDescData = {
        ...new BannerDescriptionsEntity(),
        ...this.bannerDescriptionRepo.setData(data),
        banner_id: banner.banner_id,
      };

      const bannerDesc = await this.bannerDescriptionRepo.create(
        bannerDescData,
      );

      result = { ...result, ...bannerDesc };

      const bannerImage = await this.imageRepo.create({
        image_path: data.image_path,
      });

      const bannerImageLink = await this.imageLinkRepo.create({
        object_id: result.banner_id,
        object_type: ImageObjectType.BANNER,
        image_id: bannerImage.image_id,
      });

      result = { ...result, image: { ...bannerImage, ...bannerImageLink } };

      results = [...results, result];
    }
    return results;
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
      const bannerImageLink = await this.imageLinkRepo.findOne({
        object_id: result.banner_id,
        object_type: ImageObjectType.BANNER,
      });
      if (bannerImageLink) {
        const updatedImage = await this.imageRepo.update(
          bannerImageLink.image_id,
          { image_path: data.image_path },
        );
        result = { ...result, image: { ...bannerImageLink, ...updatedImage } };
      }
    }

    return result;
  }

  async delete(banner_id: number) {
    await this.bannerRepo.delete({ banner_id });
    await this.bannerDescriptionRepo.delete({ banner_id });
    const bannerImageLink = await this.imageLinkRepo.findOne({
      object_id: banner_id,
      object_type: ImageObjectType.BANNER,
    });
    await this.imageLinkRepo.delete({
      object_id: banner_id,
      object_type: ImageObjectType.BANNER,
    });
    await this.imageRepo.delete({ image_id: bannerImageLink.image_id });
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
      url: UPLOAD_IMAGE_API,
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
