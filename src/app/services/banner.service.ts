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

import {
  getPageSkipLimit,
  convertQueryParamsIntoCachedString,
} from '../../utils/helper';
import { MoreThan, Not, Equal } from '../../database/operators/operators';
import {
  cacheKeys,
  cacheTables,
  prefixCacheKey,
} from '../../utils/cache.utils';
import { RedisCacheService } from './redisCache.service';
import { CDN_URL } from '../../constants/api.appcore';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { convertToSlug } from '../../utils/helper';
import {
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from '../../database/operators/operators';
@Injectable()
export class bannerService {
  private logger = new Logger();
  constructor(
    private bannerRepo: BannerRepository<BannerEntity>,
    private bannerDescriptionRepo: BannerDescriptionsRepository<BannerDescriptionsEntity>,
    private imageService: ImagesService,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private bannerLocationsDescRepo: BannerLocationDescriptionRepository<BannerLocationDescriptionEntity>,
    private bannerTargetDescRepo: BannerTargetDescriptionRepository<BannerTargetDescriptionEntity>,
    private bannerItemRepo: BannerItemRepository<BannerItemEntity>,
    private cache: RedisCacheService,
    private schedulerRegistry: SchedulerRegistry,
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

    let result = {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : banners.length,
      },
      banners,
    };

    const bannerItems = await this.bannerItemRepo.find();
    for (let [i, bannerItem] of bannerItems.entries()) {
      let newImagePath = bannerItem.image_url.replace(CDN_URL, '');
      await this.bannerItemRepo.update(
        { banner_item_id: bannerItem.banner_item_id },
        { image_url: newImagePath },
      );
    }

    return result;
  }

  async getListFE(params) {
    let { slug, device_type, target_id, location_id, page, limit } = params;
    slug = slug || '/';
    device_type = device_type || 'D';

    let bannersCacheResult = await this.cache.getBanners(params);
    if (bannersCacheResult) {
      return bannersCacheResult;
    }

    let banners;
    if (target_id && location_id) {
      banners = await this.bannerRepo.find({
        select: '*',
        join: bannerJoiner,
        where: {
          [`${Table.BANNER}.status`]: 'A',
          [`${Table.BANNER_LOCATION_DESCRIPTION}.location_id`]: location_id,
          [`${Table.BANNER_TARGET_DESCRIPTION}.target_id`]: target_id,
        },
      });
    } else {
      banners = await this.bannerRepo.find({
        select: '*',
        join: bannerJoiner,
        where: {
          [`${Table.BANNER}.status`]: 'A',
          [`${Table.BANNER}.device_type`]: device_type,
          [`${Table.BANNER_TARGET_DESCRIPTION}.url`]: slug,
        },
      });
    }

    let _banners = [...banners];

    if (banners.length) {
      _banners = [];
      for (let banner of banners) {
        const bannerItems = await this.bannerItemRepo.find({
          select: '*',
          where: {
            [`${Table.BANNER_ITEM}.status`]: 'A',
            [`${Table.BANNER_ITEM}.banner_id`]: banner.banner_id,
          },
          orderBy: [
            {
              field: `CASE WHEN ${Table.BANNER_ITEM}.position`,
              sortBy: ` IS NULL THEN 1 ELSE 0 END, ${Table.BANNER_ITEM}.position ASC`,
            },
          ],
        });

        let bannerItemsResult = [];
        for (let bannerItem of bannerItems) {
          if (
            bannerItem.end_at &&
            new Date(bannerItem.end_at).getTime() < Date.now()
          ) {
            continue;
          }

          if (
            bannerItem.start_at &&
            new Date(bannerItem.start_at).getTime() > Date.now()
          ) {
            continue;
          }
          bannerItemsResult = [...bannerItemsResult, bannerItem];
        }
        banner['banner_items'] = bannerItemsResult;

        _banners = [..._banners, { ...banner }];
      }
    }

    await this.cache.setBanners(params, _banners);

    return _banners;
  }

  async FEgetById(banner_id: number) {
    let banner = await this.bannerRepo.findOne({ banner_id });
    if (!banner) {
      throw new HttpException('Không tìm thấy Banner', 404);
    }
    const bannerItems = await this.bannerItemRepo.find({ banner_id });
    banner['banner_items'] = bannerItems;
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

  async getById(id: number, params = { page: 1, limit: 50 }) {
    let { page, skip, limit } = getPageSkipLimit(params);

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
        skip,
        limit,
      });

      let count = await this.bannerItemRepo.find({
        select: `COUNT(${Table.BANNER_ITEM}.banner_item_id) as total`,
        where: { [`${Table.BANNER_ITEM}.banner_id`]: id },
      });
      banner['banner_items'] = bannerItems;
      banner['banner_items_paging'] = {
        pageSize: limit,
        currentPage: page,
        total: count[0].total,
      };
    }
    return banner;
  }

  async create(data: CreateBannerDto) {
    const bannerData = {
      ...new BannerEntity(),
      ...this.bannerRepo.setData(data),
      status: 'A',
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
    //============== remove cached banner  =================
    await this.cache.removeAllCachedBanners();

    return this.getById(newBanner.banner_id);
  }

  async update(id: number, data): Promise<any> {
    const banner = await this.bannerRepo.findOne({ banner_id: id });
    if (!banner) {
      throw new HttpException('Không tìm thấy banner.', 404);
    }

    const checkDuplicatePosition = await this.bannerRepo.findOne({
      page_target_id: data.page_target_id,
      page_location_id: data.page_location_id,
      device_type: data.device_type,
      banner_id: Not(Equal(banner.banner_id)),
    });
    if (checkDuplicatePosition) {
      throw new HttpException('Vị trí bị trùng trên trang', 400);
    }
    //============== remove cached banner  =================

    const bannerData = this.bannerRepo.setData({
      ...data,
      status: 'A',
      updated_at: formatStandardTimeStamp(),
    });

    await this.bannerRepo.update({ banner_id: id }, bannerData);

    let arrId = [];

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
        let newBannerItem = await this.bannerItemRepo.create(newBannerItemData);
        if (!bannerItem.status) {
          await this.addTimeoutTurnOnBannerItem(newBannerItem.banner_item_id);
        }
        arrId.push(newBannerItem.banner_item_id);
      }
    }
    const newBannerItems = await this.bannerItemRepo.find({ banner_id: id });
    if (newBannerItems && newBannerItems.length) {
      for (let newBannerItem of newBannerItems) {
        if (!arrId.includes(newBannerItem.banner_item_id)) {
          await this.addTimeoutTurnOnBannerItem(newBannerItem.banner_item_id);
        }
      }
    }
    await this.cache.removeAllCachedBanners();

    return this.getById(id);
  }

  async delete(banner_id: number) {
    await this.bannerRepo.delete({ banner_id });
    await this.bannerDescriptionRepo.delete({ banner_id });
    await this.bannerItemRepo.delete({ banner_id });
  }

  async getAllBannerTarget() {
    return this.bannerTargetDescRepo.find({});
  }

  async BannerTargetDescriptioncreate(data: CreateBannerTargetDescriptionDto) {
    const bannerTargetData = {
      ...new BannerTargetDescriptionEntity(),
      ...this.bannerTargetDescRepo.setData(data),
    };

    await this.bannerTargetDescRepo.create(bannerTargetData);
    return this.getAllBannerTarget();
  }

  async turnOnBannerItem(banner_item_id) {
    console.log('Turn on banner item');
    await this.bannerItemRepo.update({ banner_item_id }, { status: 'A' });
    const bannerItem = await this.bannerItemRepo.findOne({ banner_item_id });
    await this.schedulerRegistry.deleteTimeout(
      convertToSlug(bannerItem.title) +
        '-start-at-' +
        convertToSlug(bannerItem.start_at),
    );
    if (bannerItem.end_at) {
      await this.addTimeoutTurnOffBannerItem(banner_item_id);
    }
  }

  async turnOffBannerItem(banner_item_id) {
    console.log('Turn off banner item');
    await this.bannerItemRepo.update({ banner_item_id }, { status: 'D' });
    const bannerItem = await this.bannerItemRepo.findOne({ banner_item_id });
    await this.schedulerRegistry.deleteTimeout(
      convertToSlug(bannerItem.title) +
        '-end-at-' +
        convertToSlug(bannerItem.end_at),
    );
    await this.logger.warn(
      `Timeout ${
        convertToSlug(bannerItem.title) +
        '-end-at-' +
        convertToSlug(bannerItem.end_at)
      } deleted!`,
    );
  }

  async addTimeoutTurnOffBannerItem(banner_item_id) {
    const callback = () => {
      this.turnOffBannerItem(banner_item_id);
    };

    const bannerItem = await this.bannerItemRepo.findOne({ banner_item_id });
    const endDate = formatStandardTimeStamp(bannerItem['end_at']).toString();
    const today = formatStandardTimeStamp();
    const milliseconds =
      new Date(endDate).getTime() - new Date(today).getTime();
    const timeout = setTimeout(callback, milliseconds);
    console.log(
      'banner item will end after ' + milliseconds / 3600000 + ' hours.',
    );
    this.schedulerRegistry.addTimeout(
      convertToSlug(bannerItem.title) +
        '-end-at-' +
        convertToSlug(bannerItem.end_at),
      timeout,
    );
  }

  async addTimeoutTurnOnBannerItem(banner_item_id) {
    const callback = () => {
      this.turnOnBannerItem(banner_item_id);
    };

    const bannerItem = await this.bannerItemRepo.findOne({ banner_item_id });
    const startDate = formatStandardTimeStamp(
      bannerItem['start_at'],
    ).toString();
    const endDate = formatStandardTimeStamp(bannerItem['end_at']).toString();
    const today = formatStandardTimeStamp();

    //Không có cả ngày bắt đầu và ngày kết thúc
    if (!bannerItem.start_day && !bannerItem.end_at) {
      console.log('Turn on banner item');
      await this.bannerItemRepo.update({ banner_item_id }, { status: 'A' });
      return;
    }

    //Chỉ có ngày bắt đầu
    if (!bannerItem.end_at) {
      if (new Date(today).getTime() > new Date(startDate).getTime()) {
        console.log('Turn on banner item');
        await this.bannerItemRepo.update({ banner_item_id }, { status: 'A' });
        return;
      }

      const callback = () => {
        this.turnOnBannerItem(banner_item_id);
      };
      const milliseconds =
        new Date(startDate).getTime() - new Date(today).getTime();
      const timeout = setTimeout(callback, milliseconds);
      console.log(
        'banner item will start after ' + milliseconds / 3600000 + ' hours.',
      );
      this.schedulerRegistry.addTimeout(
        convertToSlug(bannerItem.title) +
          '-start-at-' +
          convertToSlug(bannerItem.start_at),
        timeout,
      );
      return;
    }

    //Chỉ có ngày kết thúc
    if (!bannerItem.start_at) {
      if (new Date(today).getTime() > new Date(endDate).getTime()) {
        console.log('Banner đã quá hạn.');
        await this.bannerItemRepo.update({ banner_item_id }, { status: 'D' });
        return;
      }
      console.log('Turn on tradein program');
      await this.bannerItemRepo.update({ banner_item_id }, { status: 'A' });
      await this.addTimeoutTurnOffBannerItem(banner_item_id);
      return;
    }

    // Có cả ngày bắt đầu và kết thúc
    if (new Date(today).getTime() > new Date(endDate).getTime()) {
      console.log('Banner đã quá hạn.');
      await this.bannerItemRepo.update({ banner_item_id }, { status: 'D' });
      return;
    }

    if (
      new Date(today).getTime() > new Date(startDate).getTime() &&
      new Date(today).getTime() < new Date(endDate).getTime()
    ) {
      console.log('Turn on banner');
      await this.bannerItemRepo.update({ banner_item_id }, { status: 'A' });
      await this.addTimeoutTurnOffBannerItem(banner_item_id);
      return;
    }

    const milliseconds =
      new Date(startDate).getTime() - new Date(today).getTime();
    const timeout = setTimeout(callback, milliseconds);
    console.log(
      'banner item will start after ' + milliseconds / 3600000 + ' hours.',
    );
    this.schedulerRegistry.addTimeout(
      convertToSlug(bannerItem.title) +
        '-start-at-' +
        convertToSlug(bannerItem.start_at),
      timeout,
    );
  }
}
