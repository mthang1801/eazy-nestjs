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
import { IBannerResult } from '../interfaces/bannerResult.interface';
import { CreateBannerDto } from '../dto/banner/create-banner.dto';
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
import { bannerItemsJoiner, bannerJoiner } from 'src/utils/joinTable';
import { Like } from 'src/database/find-options/operators';
import { BannerPageDescriptionEntity } from '../entities/bannerPageDescription.entity';
import * as moment from 'moment';
import { BannerItemEntity } from '../entities/bannerItem.entity';
import { BannerItemRepository } from '../repositories/bannerItemDescription.repository';
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
    private bannerItemRepo: BannerItemRepository<BannerItemEntity>,
  ) {}
  async getList(params) {
    let { page, limit, search, created_at, updated_at, status } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (status) {
      filterCondition['status'] = status;
    }
    if (created_at) {
      filterCondition['created_at'] = Like(
        moment(created_at).format('YYYY-MM-DD'),
      );
    }
    if (updated_at) {
      filterCondition['updated_at'] = Like(
        moment(updated_at).format('YYYY-MM-DD'),
      );
    }

    const banners = await this.bannerRepo.find({
      select: `*, ${Table.BANNER}.*`,
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
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : banners.length,
      },
      banners,
    };
  }

  async getLocationsList() {
    return this.bannerLocationsDescRepo.find();
  }

  async getTargetsList() {
    return this.bannerTargetDescRepo.find();
  }

  async getById(id: number) {
    const banner = await this.bannerRepo.findOne({
      select: `*, ${Table.BANNER}.*`,
      join: bannerJoiner,
      where: { [`${Table.BANNER}.banner_id`]: id },
    });

    const bannerImageLink = await this.imageLinkRepo.findOne({
      object_id: id,
      object_type: ImageObjectType.BANNER,
    });

    if (bannerImageLink) {
      const bannerImage = await this.imageRepo.findById({
        image_id: bannerImageLink.image_id,
      });
      banner['image'] = bannerImage;
    }

    const bannerItems = await this.bannerItemRepo.find({
      select: '*',
      join: bannerItemsJoiner,
      where: { [`${Table.BANNER_ITEM}.banner_id`]: banner.banner_id },
    });

    banner['banner_items'] = bannerItems;
    return banner;
  }

  async create(data: CreateBannerDto) {
    const bannerData = {
      ...new BannerEntity(),
      ...this.bannerRepo.setData(data),
    };
    const newBanner = await this.bannerRepo.create(bannerData);

    const bannerDescData = {
      ...new BannerDescriptionsEntity(),
      ...this.bannerDescriptionRepo.setData(data),
    };

    const newBannerDesc = await this.bannerDescriptionRepo.create(
      bannerDescData,
    );

    if (data.banner_items.length) {
      for (let bannerItem of data.banner_items) {
        const newBannerItemData = {
          ...new BannerItemEntity(),
          ...this.bannerItemRepo.setData(bannerItem),
          banner_id: newBanner.banner_id,
        };
        const newBannerItem = await this.bannerItemRepo.create(
          newBannerItemData,
        );
      }
    }

    const newImageBanner = await this.imageRepo.create({
      image_path: data.image_path,
    });
    await this.imageLinkRepo.create({
      object_id: newBanner.banner_id,
      object_type: ImageObjectType.BANNER,
      image_id: newImageBanner.image_id,
    });
  }

  // async update(id: number, data: UpdateBannerDTO): Promise<any> {
  //   const banner = await this.bannerRepo.findById(id);
  //   if (!banner) {
  //     throw new HttpException('Không tìm thấy banner.', 404);
  //   }

  //   let result: any = { ...banner };

  //   const bannerData = this.bannerRepo.setData(data);
  //   if (Object.entries(bannerData).length) {
  //     const updatedBanner = await this.bannerRepo.update(
  //       { banner_id: id },
  //       bannerData,
  //     );
  //     result = { ...result, ...updatedBanner };
  //   }

  //   const bannerDescData = this.bannerDescriptionRepo.setData(data);
  //   if (Object.entries(bannerDescData).length) {
  //     const updatedBannerDesc = await this.bannerDescriptionRepo.update(
  //       { banner_id: id },
  //       bannerDescData,
  //     );
  //     result = { ...result, ...updatedBannerDesc };
  //   }

  //   if (data.image_path) {
  //     const bannerImageLink = await this.imageLinkRepo.findOne({
  //       object_id: result.banner_id,
  //       object_type: ImageObjectType.BANNER,
  //     });
  //     if (bannerImageLink) {
  //       const updatedImage = await this.imageRepo.update(
  //         bannerImageLink.image_id,
  //         { image_path: data.image_path },
  //       );
  //       result = { ...result, image: { ...bannerImageLink, ...updatedImage } };
  //     }
  //   }

  //   if (data?.displays?.length) {
  //     for (let displayItem of data.displays) {
  //       if (displayItem.page_id) {
  //         const bannerPage = await this.bannerPageDescRepo.findOne({
  //           page_id: displayItem.page_id,
  //         });
  //         if (bannerPage) {
  //           const bannerPageData = this.bannerPageDescRepo.setData(displayItem);
  //           await this.bannerPageDescRepo.update(
  //             { page_id: displayItem.page_id },
  //             bannerPageData,
  //           );
  //         }
  //       } else {
  //         // Tạo thêm banner nếu ko có page_id
  //         const bannerPageData = {
  //           ...new BannerPageDescriptionEntity(),
  //           ...this.bannerPageDescRepo.setData(displayItem),
  //         };

  //         const newBannerPage = await this.bannerPageDescRepo.create(
  //           bannerPageData,
  //         );

  //         const bannerData = {
  //           ...new BannerEntity(),
  //           ...this.bannerRepo.setData(result),
  //           ...this.bannerRepo.setData(displayItem),
  //           page_id: newBannerPage.page_id,
  //         };
  //         const newBanner = await this.bannerRepo.create(bannerData);

  //         const bannerDescData = {
  //           ...new BannerDescriptionsEntity(),
  //           ...this.bannerDescriptionRepo.setData(result),
  //           ...this.bannerDescriptionRepo.setData(displayItem),
  //           banner_id: newBanner.banner_id,
  //         };
  //         const bannerDesc = await this.bannerDescriptionRepo.create(
  //           bannerDescData,
  //         );

  //         let image_path = '';

  //         const oldbannerImageLink = await this.imageLinkRepo.findOne({
  //           object_type: ImageObjectType.BANNER,
  //           object_id: result.banner_id,
  //         });
  //         if (oldbannerImageLink) {
  //           const bannerImage = await this.imageRepo.findOne({
  //             image_id: oldbannerImageLink.image_id,
  //           });
  //           image_path = bannerImage.image_path;
  //         }

  //         const newBannerImage = await this.imageRepo.create({ image_path });
  //         await this.imageLinkRepo.create({
  //           object_type: ImageObjectType.BANNER,
  //           object_id: newBanner.banner_id,
  //           image_id: newBannerImage.image_id,
  //         });
  //       }
  //     }
  //   }
  // }

  // async delete(banner_id: number) {
  //   await this.bannerRepo.delete({ banner_id });
  //   await this.bannerDescriptionRepo.delete({ banner_id });
  //   const bannerImageLink = await this.imageLinkRepo.findOne({
  //     object_id: banner_id,
  //     object_type: ImageObjectType.BANNER,
  //   });
  //   await this.imageLinkRepo.delete({
  //     object_id: banner_id,
  //     object_type: ImageObjectType.BANNER,
  //   });
  //   await this.imageRepo.delete({ image_id: bannerImageLink.image_id });
  // }

  // async getAllIamgesByBannerId(id): Promise<any> {
  //   return this.imageService.getAllIamgesByBannerId(id);
  // }
  // async updateBannerById(banner_id, images_id, body): Promise<any> {
  //   return this.imageService.Update(body, banner_id, images_id);
  // }
}
