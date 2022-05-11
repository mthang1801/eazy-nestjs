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
import { CreateBannerTargetDescriptionDto } from '../dto/banner/create-bannerTargetDescription.dto';
import { UpdateBannerTargetDescriptionDto } from '../dto/banner/update-bannerTargetDescription.dto';
import { MoreThan } from '../../database/operators/operators';
import { getPageSkipLimit } from '../../utils/helper';
import {
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from '../../database/operators/operators';
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
    let {
      page,
      limit,
      search,
      created_at,
      status,
      device_type,
      page_location_id,
      page_target_id,
      created_at_start,
      created_at_end,
      start_at,
      end_at,
    } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let filterConditions = {};
    if (status) {
      filterConditions['status'] = status;
    }
    if (created_at_start && created_at_end) {
      filterConditions[`${Table.BANNER}.created_at`] = Between(
        created_at_start,
        created_at_end,
      );
    } else if (created_at_start) {
      filterConditions[`${Table.BANNER}.created_at`] =
        MoreThanOrEqual(created_at_start);
    } else if (created_at_end) {
      filterConditions[`${Table.BANNER}.created_at`] =
        LessThanOrEqual(created_at_start);
    }

    if (start_at) {
      filterConditions[`${Table.BANNER}.start_at`] = MoreThan(start_at);
    }
    if (end_at) {
      filterConditions[`${Table.BANNER}.end_at`] = LessThanOrEqual(end_at);
    }

    if (page_location_id) {
      filterConditions['page_location_id'] = page_location_id;
    }

    if (page_target_id) {
      filterConditions['page_target_id'] = page_target_id;
    }

    if (device_type) {
      filterConditions['device_type'] = device_type;
    }

    const banners = await this.bannerRepo.find({
      select: `*, ${Table.BANNER}.*`,
      join: bannerJoiner,
      orderBy: [
        { field: 'page_target_id', sortBy: SortBy.DESC },
        { field: 'page_location_id', sortBy: SortBy.DESC },
        { field: 'updated_at', sortBy: SortBy.DESC },
      ],
      where: bannerSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    if (banners.length) {
      for (let banner of banners) {
        const bannerItems = await this.bannerItemRepo.find({
          banner_id: banner['banner_id'],
        });
        banner['banner_items'] = bannerItems;
      }
    }

    const count = await this.bannerRepo.find({
      select: `COUNT(DISTINCT(${Table.BANNER}.banner_id)) as total`,
      join: bannerJoiner,
      where: bannerSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : banners.length,
      },
      banners,
    };
  }

  async getListFE(params) {
    let { page_location_name, page_target_name, device_type } = params;
    device_type = device_type || 'D';
    let pageLocation = await this.bannerLocationsDescRepo.findOne({
      location_description: page_location_name,
    });
    if (!pageLocation) {
      throw new HttpException('Không tìm vị trí hiển thị', 404);
    }
    let pageTarget = await this.bannerTargetDescRepo.findOne({
      target_description: page_target_name,
    });
    if (!pageTarget) {
      throw new HttpException('Không tìm thấy trang hiển thị', 404);
    }
    let banner = await this.bannerRepo.findOne({
      select: '*',
      where: {
        [`${Table.BANNER}.page_location_id`]: pageLocation.location_id,
        [`${Table.BANNER}.page_target_id`]: pageTarget.target_id,
        [`${Table.BANNER}.status`]: 'A',
        [`${Table.BANNER}.device_type`]: device_type,
        [`${Table.BANNER}.start_at`]: LessThanOrEqual(
          formatStandardTimeStamp(),
        ),
        [`${Table.BANNER}.end_at`]: MoreThanOrEqual(formatStandardTimeStamp()),
      },
    });
    if (banner) {
      const bannerItems = await this.bannerItemRepo.find({
        select: '*',
        where: {
          [`${Table.BANNER_ITEM}.status`]: 'A',
          [`${Table.BANNER_ITEM}.start_at`]: LessThanOrEqual(
            formatStandardTimeStamp(),
          ),
          [`${Table.BANNER_ITEM}.end_at`]: MoreThanOrEqual(
            formatStandardTimeStamp(),
          ),
        },
        orderBy: [
          {
            field: `CASE WHEN ${Table.BANNER_ITEM}.position`,
            sortBy: ` IS NULL THEN 1 ELSE 0 END, ${Table.BANNER_ITEM}.position ASC`,
          },
        ],
      });
      banner['banner_items'] = bannerItems;
    }
    return banner;
  }

  async getLocationsList() {
    return this.bannerLocationsDescRepo.find();
  }

  async getTargetsList(params) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search } = params;
    let targetsList = await this.bannerTargetDescRepo.find({
      select: '*',
      where: {
        [`${Table.BANNER_TARGET_DESCRIPTION}.target_description`]: search
          ? Like(search)
          : Like(''),
      },
      skip,
      limit,
    });
    let count = await this.bannerTargetDescRepo.find({
      select: 'count(*) as total',
      where: {
        [`${Table.BANNER_TARGET_DESCRIPTION}.target_description`]: search
          ? Like(search)
          : Like(''),
      },
    });

    return {
      paging: {
        pageSize: limit,
        currentPage: page,
        total: count[0].total,
      },
      data: targetsList,
    };
  }

  async getById(id: number) {
    const banner = await this.bannerRepo.findOne({
      select: `*`,
      join: bannerJoiner,
      where: { [`${Table.BANNER}.banner_id`]: id },
    });

    if (banner) {
      const bannerItems = await this.bannerItemRepo.find({
        select: '*',

        orderBy: [
          {
            field: `CASE WHEN ${Table.BANNER_ITEM}.position`,
            sortBy: ` IS NULL THEN 1 ELSE 0 END, ${Table.BANNER_ITEM}.position ASC`,
          },
        ],
        where: { [`${Table.BANNER_ITEM}.banner_id`]: id },
      });
      banner['banner_items'] = bannerItems;
    }
    return banner;
  }

  async create(data: CreateBannerDto) {
    const bannerData = {
      ...new BannerEntity(),
      ...this.bannerRepo.setData(data),
    };

    const checkDuplicatePosition = await this.bannerRepo.findOne({
      page_target_id: data.page_target_id,
      page_location_id: data.page_location_id,
      device_type: data.device_type,
    });

    if (checkDuplicatePosition) {
      throw new HttpException('Vị trí bị trùng trên trang', 400);
    }
    const newBanner = await this.bannerRepo.create(bannerData);

    if (data.banner_items) {
      for (let bannerItem of data.banner_items) {
        const newBannerItemData = {
          ...new BannerItemEntity(),
          ...this.bannerItemRepo.setData(bannerItem),
          banner_id: newBanner.banner_id,
        };
        await this.bannerItemRepo.create(newBannerItemData, false);
      }
    }

    return this.getById(newBanner.banner_id);
  }

  async update(id: number, data): Promise<any> {
    const banner = await this.bannerRepo.findOne({ banner_id: id });
    if (!banner) {
      throw new HttpException('Không tìm thấy banner.', 404);
    }

    const bannerData = this.bannerRepo.setData({
      ...data,
      updated_at: formatStandardTimeStamp(),
    });

    await this.bannerRepo.update({ banner_id: id }, bannerData);

    if (data.banner_items && data.banner_items.length) {
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

    return this.getById(id);
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

  async getAllBannerTarget() {
    return this.bannerTargetDescRepo.find({
      select: ['*'],
    });
  }

  async BannerTargetDescriptioncreate(data: CreateBannerTargetDescriptionDto) {
    const bannerTargetData = {
      ...new BannerTargetDescriptionEntity(),
      ...this.bannerTargetDescRepo.setData(data),
    };

    await this.bannerTargetDescRepo.create(bannerTargetData);
    return this.getAllBannerTarget();
  }
}
