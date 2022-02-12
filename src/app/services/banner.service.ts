import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BannerEntity } from '../entities/banner.entity';
import { BannerRepository } from '../repositories/banner.repository';

import { ImagesService } from './image.service';
import { Table, JoinTable } from '../../database/enums/index';
import { convertToMySQLDateTime } from 'src/utils/helper';
import { BannerDescriptionsRepository } from '../repositories/bannerDescription.respository';
import { BannerDescriptionsEntity } from '../entities/bannerDescriptions.entity';
import { Like } from 'typeorm';
import { bannerCreateDTO } from '../dto/banner/create-banner.dto';
import { updateBannerDTO } from '../dto/banner/update-banner.dto';
import { createBannerImageDTO } from '../dto/banner/create-banner-image.dto';
import { IBannerResult } from '../interfaces/bannerResult.interface';

@Injectable()
export class bannerService {
  constructor(
    private repository: BannerRepository<BannerEntity>,
    private bannerDescriptionRepo: BannerDescriptionsRepository<BannerDescriptionsEntity>,
    private imageService: ImagesService,
  ) {}
  async getList(params): Promise<IBannerResult[]> {
    //=====Filter param
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 9999;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.repository.tableProps.includes(key)) {
          filterCondition[`${Table.BANNER}.${key}`] = Like(val);
        } else {
          filterCondition[`${Table.BANNER_DESCRIPTIONS}.${key}`] = Like(val);
        }
      }
    }
    //===
    const banner = this.repository.find({
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
  async getById(id): Promise<IBannerResult> {
    const string = `${Table.BANNER}.banner_id`;
    const banner = this.repository.findOne({
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
  async create(data: bannerCreateDTO): Promise<IBannerResult> {
    ///==========================|Add to ddve_banner table|==============
    const bannerTableData = {
      ...this.repository.setData(data),
      created_at: convertToMySQLDateTime(),
    };
    let _banner = await this.repository.create(bannerTableData);

    //===========================|Add to ddve_banner description|======

    const bannerDescriptionTableData = {
      banner_id: _banner.banner_id,
      ...this.bannerDescriptionRepo.setData(data),
    };
    let _banner_description = await this.bannerDescriptionRepo.create(
      bannerDescriptionTableData,
    );

    //===========================|Add to ddve_images |=============================
    await this.imageService.Create(data, _banner.banner_id);
    //===========================|Add to ddve_images_links|=============================

    return _banner;
  }
  async update(data: updateBannerDTO, id: string): Promise<any> {
    //===================|Update ddve_banner table|===================
    const bannerTableData = {
      ...this.repository.setData(data),
    };

    let _banner = this.repository.update(+id, bannerTableData);
    //===========================|Add to ddve_banner description|======

    const bannerDescriptionTableData = {
      ...this.bannerDescriptionRepo.setData(data),
    };

    let _banner_description = this.bannerDescriptionRepo.update(
      +id,
      bannerDescriptionTableData,
    );

    const result = await Promise.all([_banner, _banner_description]);
    return result[0];
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
}
