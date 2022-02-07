import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { Banner } from '../entities/banner.entity';
import { BannerRepository } from '../repositories/banner.repository';
import {
  BannerCreateDTO,
  UpdateBannerDTO,
  createBannerImageDTO,
} from '../dto/banner/banner.dto';
import { BannerImagesService } from './banner_images.service';
import { BannerDescriptionsService } from './banner_description.service';
import { ImagesService } from './image.service';
import { ImagesLinksService } from './image_link.service';
import { Table, JoinTable } from '../../database/enums/index';
import { convertToMySQLDateTime } from 'src/utils/helper';

@Injectable()
export class BannerService extends BaseService<
Banner,
BannerRepository<Banner>
> {
  constructor(
    repository: BannerRepository<Banner>,
    table: Table,
    private bannerImagesService: BannerImagesService,
    private imageService: ImagesService,
    private imageLinkService: ImagesLinksService,
    private bannerDescriptionsService: BannerDescriptionsService,
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
    const images = this.imageLinkService.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_images: {
            fieldJoin: 'image_id',
            rootJoin: `${Table.IMAGE_LINK}.image_id`,
          },
        },
      },
      skip: 0,
      limit: 30,
    });

    const result = await Promise.all([images, banner]);
    let _banner=[];
    result[1].forEach(ele=>{
  
      console.log({...ele,images:result[0].filter(img=>img.object_id==ele.banner_id)})
      _banner.push({...ele,images:result[0].filter(img=>img.object_id==ele.banner_id)})
     
    })
    return _banner;
  }
  async getById(id) {
    const string = `${this.table}.banner_id`;
    const string1 =`${Table.IMAGE_LINK}.object_id`
    const banner =  this.repository.findOne({
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
   
    const images = this.imageLinkService.find({
      select: ['*'],
      where: { [string1]: id },

      join: {
        [JoinTable.join]: {
          ddv_images: {
            fieldJoin: 'image_id',
            rootJoin: `${Table.IMAGE_LINK}.image_id`,
          },
        },
      },
      skip: 0,
      limit: 30,
    });

    const result = await Promise.all([images, banner]);
   
    return {...result[1],images:result[0]};
  }
  async Create(data: BannerCreateDTO) {
    ////=====================| Flow|====================
    ///=== admin hoặc client sẽ truyền vào 2 thuộc tính quan trọng là tên banner, hinh cua banner
    //== optional description

    try {
      const {
        status,
        type,
        target,
        localization,
        position,
        image_url,
        banner,
        description,
        url,
        image_x,
        image_y,
        is_high_res,
      } = data;
      ///==========================|Add to ddve_banner table|==============
      const bannerTableData = {
        status: status,
        type: type,
        target: target,
        localization: localization,
        position: position,
        created_at: convertToMySQLDateTime(),
      };
      Object.keys(bannerTableData).forEach(
        (key) =>
          bannerTableData[key] === undefined && delete bannerTableData[key],
      );
      let _banner = await this.repository.create(bannerTableData);
      //===========================|Add to ddve_banner description|======
      const bannerDescriptionTableData = {
        banner_id: _banner.banner_id,
        banner: banner,
        url: url,
        description: description,
      };
      Object.keys(bannerDescriptionTableData).forEach(
        (key) =>
          bannerDescriptionTableData[key] === undefined &&
          delete bannerDescriptionTableData[key],
      );
      let _banner_description = await this.bannerDescriptionsService.Create(
        bannerDescriptionTableData,
      );
      //===========================|Add to ddve_images |=============================
      const imageTableData = {
        image_path: image_url,
        image_x: image_x,
        image_y: image_y,
        is_high_res: is_high_res,
      };
      Object.keys(imageTableData).forEach(
        (key) =>
          imageTableData[key] === undefined && delete imageTableData[key],
      );
      let _images = await this.imageService.Create(imageTableData);
      //===========================|Add to ddve_images_links|=============================
      const imageLinkTableData = {
        object_id: _banner.banner_id,
        object_type: 'banners',
        image_id: _images.image_id,
        position: position,
      };
      Object.keys(imageLinkTableData).forEach(
        (key) =>
          imageLinkTableData[key] === undefined &&
          delete imageLinkTableData[key],
      );
      let _images_link = await this.imageLinkService.Create(imageLinkTableData);
      //===========================|Add to ddve_banner_images|=============================
      // const bannerImageTableData = {
      //   banner_id: _banner.banner_id,
      //   banner_image_id: _images.image_id,
      // };
      // Object.keys(bannerImageTableData).forEach(
      //   (key) =>
      //     bannerImageTableData[key] === undefined &&
      //     delete bannerImageTableData[key],
      // );
      // let _banner_image = await this.bannerImagesService.Create(
      //   bannerImageTableData,
      // );

<<<<<<< HEAD
      return 'Banner Added';
=======
      return _banner;
>>>>>>> 11b8db9ea894b527e1bffbaceefbfb7a802f617f
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async Update(data: UpdateBannerDTO, id: string) {
    const { url, image, banner, description, position, status, type } = data;
    //===================|Update ddve_banner table|===================
    const bannerTableData = {
      status: status,
      type: type,
      position: position,
    };
    Object.keys(bannerTableData).forEach(
      (key) =>
        bannerTableData[key] === undefined && delete bannerTableData[key],
    );
    let _banner = this.repository.update(parseInt(id), bannerTableData);
    //===========================|Add to ddve_banner description|======
    const bannerDescriptionTableData = {
      banner: banner,
      url: url,
      description: description,
    };
    Object.keys(bannerDescriptionTableData).forEach(
      (key) =>
        bannerDescriptionTableData[key] === undefined &&
        delete bannerDescriptionTableData[key],
    );
    let _banner_description = this.bannerDescriptionsService.update(
      parseInt(id),
      bannerDescriptionTableData,
    );

    //===============|Get the image id then update the url|===============
    const imagebyBanner = await this.imageLinkService.findOne({
      where: { object_id: parseInt(id) },
    });
    console.log(imagebyBanner);
    //===========================|Add to ddve_images |=============================
    const imageTableData = {
      image_path: image,
    };
    Object.keys(imageTableData).forEach(
      (key) => imageTableData[key] === undefined && delete imageTableData[key],
    );
    let _images = this.imageService.update(
      imagebyBanner.image_id,
      imageTableData,
    );
    //===========================|Add to ddve_images_links|=============================
    const imageLinkTableData = {
      position: position,
    };
    Object.keys(imageLinkTableData).forEach(
      (key) =>
        imageLinkTableData[key] === undefined && delete imageLinkTableData[key],
    );
    let _images_link = this.imageLinkService.update(
      imagebyBanner.image_id,
      imageLinkTableData,
    );

    //=====
    const result = await Promise.all([_banner, _banner_description, _images, _images_link]);
    return result[0];
  }
  async Delete(banner_id, images_id) {
    //Check if banner_id match with images_id
    let count = await this.bannerImagesService.find({
      where: { banner_id: banner_id, banner_image_id: images_id },
    });
    if (count.length <= 0) return `Khong ton tai`;
    let _image = this.imageService.delete(images_id);
    let _image_link = this.imageLinkService.delete(images_id);
    Promise.all([_image, _image_link]);
  }
  async createBannerImage(data: createBannerImageDTO, id) {
    try {
      const { position, image_url, image_x, image_y, is_high_res } = data;
      const imageTableData = {
        image_path: image_url,
        image_x: image_x,
        image_y: image_y,
        is_high_res: is_high_res,
      };
      Object.keys(imageTableData).forEach(
        (key) =>
          imageTableData[key] === undefined && delete imageTableData[key],
      );
      let _images = await this.imageService.Create(imageTableData);
      const imageLinkTableData = {
        object_id: id,
        object_type: 'banners',
        image_id: _images.image_id,
        position: position,
      };
      Object.keys(imageLinkTableData).forEach(
        (key) =>
          imageLinkTableData[key] === undefined &&
          delete imageLinkTableData[key],
      );
      let _images_link = await this.imageLinkService.Create(imageLinkTableData);
      //===========================|Add to ddve_banner_images|=============================
      // const bannerImageTableData = {
      //   banner_id: id,
      //   banner_image_id: _images.image_id,
      // };
      // Object.keys(bannerImageTableData).forEach(
      //   (key) =>
      //     bannerImageTableData[key] === undefined &&
      //     delete bannerImageTableData[key],
      // );
      // let _banner_image = await this.bannerImagesService.Create(
      //   bannerImageTableData,
      // );
      return 'Banner Added';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllIamgesByBannerId(id) {
    const string = `ddv_banner_images.banner_id`;

    const image = await this.bannerImagesService.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_images_links: {
            fieldJoin: 'ddv_images_links.object_id',
            rootJoin: 'ddv_banner_images.banner_id',
          },

          ddv_images: {
            fieldJoin: ' ddv_images.image_id',
            rootJoin: 'ddv_banner_images.banner_image_id',
          },
        },
      },
      where: { [string]: id },

      skip: 0,
      limit: 30,
    });
    return image;
  }
}
