import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { BannerEntity } from '../entities/banner.entity';
import { BannerRepository } from '../repositories/banner.repository';
import {
  BannerCreateDTO,
  UpdateBannerDTO,
  createBannerImageDTO,
} from '../dto/banner/banner.dto';
import { ImagesService } from './image.service';
import { Table, JoinTable } from '../../database/enums/index';
import { convertToMySQLDateTime } from 'src/utils/helper';
import { BannerDescriptionsRepository } from '../repositories/banner_description.respository';
import { BannerDescriptionsEntity } from '../entities/banner_descriptions.entity';

@Injectable()
export class BannerService extends BaseService<
BannerEntity,
BannerRepository<BannerEntity>
> {
  constructor(
    repository: BannerRepository<BannerEntity>,
    table: Table,
    private bannerDescriptionRepo: BannerDescriptionsRepository<BannerDescriptionsEntity>,
    private imageService: ImagesService,
  ) {
    super(repository, table);
    this.table = Table.BANNER;
  }
  async getAll() {
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

      skip: 0,
      limit: 30,
    });
    const images = this.imageService.GetImage();

    const result = await Promise.all([images, banner]);
    let _banner = [];
    result[1].forEach(ele => {

      _banner.push({ ...ele, images: result[0].filter(img => img.object_id == ele.banner_id) })

    })
    return _banner;
  }
  async getById(id) {
    const string = `${this.table}.banner_id`;
    const banner = this.repository.findOne({
      select: ['*'],
      where: { [string]: id },
      join: {
        [JoinTable.join]: {

          ddv_banner_descriptions: {
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
  async Create(data: BannerCreateDTO) {
    try {

      ///==========================|Add to ddve_banner table|==============
      const bannerTableData = {
        ...this.repository.setData(data, this.repository.BannerDataProps),
        created_at: convertToMySQLDateTime()
      }
      let _banner = await this.repository.create(bannerTableData);

      //===========================|Add to ddve_banner description|======

      const bannerDescriptionTableData = {
        banner_id: _banner.banner_id,
        ...this.bannerDescriptionRepo.setData(data, this.bannerDescriptionRepo.BannerDataProps)
      };
      let _banner_description = await this.bannerDescriptionRepo.create(
        bannerDescriptionTableData,
      );

      //===========================|Add to ddve_images |=============================
      await this.imageService.Create(data, _banner.banner_id);
      //===========================|Add to ddve_images_links|=============================

      return _banner;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async Update(data: UpdateBannerDTO, id: string) {
    //===================|Update ddve_banner table|===================
    const bannerTableData = {
      ...this.repository.setData(data, this.repository.BannerDataProps),
    }

    let _banner = this.repository.update(+id, bannerTableData);
    //===========================|Add to ddve_banner description|======

    const bannerDescriptionTableData = {

      ...this.bannerDescriptionRepo.setData(data, this.bannerDescriptionRepo.BannerDataProps)
    };

    let _banner_description = this.bannerDescriptionRepo.update(
      +id,
      bannerDescriptionTableData,
    );

    const result = await Promise.all([_banner, _banner_description]);
    return result[0];
  }
  async Delete(banner_id, images_id) {
    await this.imageService.Delete(banner_id, images_id)
   
  }
  async createBannerImage(data: createBannerImageDTO, id) {
    return this.imageService.Create(data,id);
    
  }

  async getAllIamgesByBannerId(id) {
    return this.imageService.getAllIamgesByBannerId(id)
   
  }
  async updateBannerById(banner_id, images_id,body){
    return this.imageService.Update(body,banner_id, images_id,)
  }
}
