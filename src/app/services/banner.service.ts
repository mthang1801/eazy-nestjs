import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { BannerEntity } from '../entities/banner.entity';
import { BannerRepository } from '../repositories/banner.repository';

import { ImagesService } from './image.service';
import { Table, JoinTable, SortBy } from '../../database/enums/index';
import { formatStandardTimeStamp } from 'src/utils/helper';
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
import { BannerTargetDescriptionRepository } from '../repositories/bannerTargetDescription.repository';
import { BannerTargetDescriptionEntity } from '../entities/bannerTargetDescription.entity';
import { bannerSearchFilter } from '../../utils/tableConditioner';
import { bannerItemsJoiner, bannerJoiner } from 'src/utils/joinTable';
import { Like } from 'src/database/operators/operators';
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
    let { page, limit, search, created_at, updated_at, status, device_type } =
      params;
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

    if (device_type) {
      filterCondition['device_type'] = device_type;
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
      banner_id: newBanner.banner_id,
    };

    await this.bannerDescriptionRepo.create(bannerDescData);

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

  async update(id: number, data: UpdateBannerDTO): Promise<any> {
    const banner = await this.bannerRepo.findOne({ banner_id: id });
    if (!banner) {
      throw new HttpException('Không tìm thấy banner.', 404);
    }
    const bannerData = this.bannerRepo.setData({
      ...data,
      updated_at: formatStandardTimeStamp(),
    });
    if (Object.entries(bannerData).length) {
      await this.bannerRepo.update({ banner_id: id }, bannerData);
    }

    const bannerDescData = await this.bannerDescriptionRepo.findOne({
      banner_id: id,
    });
    if (bannerDescData) {
      const bannerDescData = this.bannerDescriptionRepo.setData(data);
      if (Object.entries(bannerDescData).length) {
        await this.bannerDescriptionRepo.update(
          { banner_id: id },
          bannerDescData,
        );
      }
    } else {
      const bannerDescData = {
        ...new BannerDescriptionsEntity(),
        ...this.bannerDescriptionRepo.setData(data),
      };
      await this.bannerLocationsDescRepo.create(bannerDescData);
    }
    if (data?.banner_items?.length) {
      await this.bannerItemRepo.delete({
        banner_id: id,
      });
      for (let bannerItem of data.banner_items) {
        const newBannerItemData = {
          ...new BannerItemEntity(),
          ...this.bannerItemRepo.setData(bannerItem),
          banner_id: id,
        };
        await this.bannerItemRepo.create(newBannerItemData);
      }
    }

    if (data.image_path) {
      const oldImageLink = await this.imageLinkRepo.findOne({
        object_type: ImageObjectType.BANNER,
        object_id: id,
      });
      if (oldImageLink) {
        await this.imageLinkRepo.delete({
          object_type: ImageObjectType.BANNER,
          object_id: id,
        });
        await this.imageRepo.delete({ image_id: oldImageLink.image_id });
      }

      const newImageBanner = await this.imageRepo.create({
        image_path: data.image_path,
      });
      await this.imageLinkRepo.create({
        object_id: id,
        object_type: ImageObjectType.BANNER,
        image_id: newImageBanner.image_id,
      });
    }
  }

  async delete(banner_id: number) {
    await this.bannerRepo.delete({ banner_id });
    await this.bannerDescriptionRepo.delete({ banner_id });
    await this.bannerItemRepo.delete({ banner_id });
  }

  async getBySlug(params) {
    let { type, slug } = params;
    let bannerItems;
    if (type) {
      bannerItems = await this.bannerItemRepo.find({
        select: '*',
        join: bannerItemsJoiner,
        where: { page_url: slug, page_type: type },
      });
    } else {
      bannerItems = await this.bannerItemRepo.find({
        select: '*',
        join: bannerItemsJoiner,
        where: { page_url: slug },
      });
    }

    if (!bannerItems.length) {
      return bannerItems;
    }

    let result = [];
    for (let bannerItem of bannerItems) {
      bannerItem['image'] = null;
      const bannerImageLink = await this.imageLinkRepo.findOne({
        object_id: bannerItem.banner_id,
        object_type: ImageObjectType.BANNER,
      });
      if (bannerImageLink) {
        const bannerImage = await this.imageRepo.findOne({
          image_id: bannerImageLink.image_id,
        });
        bannerItem['image'] = { ...bannerImageLink, ...bannerImage };
      }

      let banner = await this.bannerRepo.findOne({
        select: '*',
        join: bannerJoiner,
        where: { [`${Table.BANNER}.banner_id`]: bannerItem['banner_id'] },
      });

      if (banner) {
        result = [...result, { ...bannerItem, ...banner }];
      }
    }

    return result;
  }
}
