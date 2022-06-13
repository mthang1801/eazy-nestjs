import { Table } from 'src/database/enums';
import { ProductDescriptionsRepository } from './../repositories/productDescriptions.respository';
import { ProductPricesRepository } from './../repositories/productPrices.repository';
import { ProductsRepository } from './../repositories/products.repository';
import { Injectable, HttpException, Logger } from '@nestjs/common';
import { DiscountProgramEntity } from '../entities/discountProgram.entity';
import { DiscountProgramRepository } from '../repositories/discountProgram.repository';
import { DiscountProgramDetailRepository } from '../repositories/discountProgramDetail.repository';
import { DiscountProgramDetailEntity } from '../entities/discountProgramDetail.entity';
import { ProductsEntity } from '../entities/products.entity';
import { ProductPricesEntity } from '../entities/productPrices.entity';
import { ProductDescriptionsEntity } from '../entities/productDescriptions.entity';
import { convertDiscountProgramFromAppcore } from '../../utils/integrateFunctions';
import {
  convertToSlug,
  formatStandardTimeStamp,
  getPageSkipLimit,
} from '../../utils/helper';
import { get, sortBy } from 'lodash';
import {
  getProductAccessorySelector,
  getProductListByDiscountProgram,
} from '../../utils/tableSelector';
import {
  discountProgramsSearchFilter,
  discountProgramsDetailSearchFilter,
} from '../../utils/tableConditioner';
import { UpdateDiscountProgramDto } from '../dto/discountProgram/update-discountProgram.dto';
import { SortBy } from '../../database/enums/sortBy.enum';
import { CacheRepository } from '../repositories/cache.repository';
import { RedisCacheService } from './redisCache.service';
import { productLeftJoiner } from '../../utils/joinTable';
import { SchedulerRegistry } from '@nestjs/schedule';
import { formatTime } from '../../utils/helper';
import { CronJob } from 'cron';
import {
  MoreThan,
  LessThan,
  MoreThanOrEqual,
  LessThanOrEqual,
} from '../../database/operators/operators';
import {
  productPromotionAccessoryJoiner,
  productDiscountProgramJoiner,
} from '../../utils/joinTable';
@Injectable()
export class DiscountProgramService {
  private logger = new Logger();
  constructor(
    private discountProgramRepo: DiscountProgramRepository<DiscountProgramEntity>,
    private discountProgramDetailRepo: DiscountProgramDetailRepository<DiscountProgramDetailEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private productPriceRepo: ProductPricesRepository<ProductPricesEntity>,
    private productDescRepo: ProductDescriptionsRepository<ProductDescriptionsEntity>,
    private cache: RedisCacheService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async getList(params: any = {}) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let {
      search,
      start_at,
      end_at,
      status,
      time_start_at,
      time_end_at,
      priority,
    } = params;
    let filterConditions = {};

    if (start_at) {
      filterConditions[`${Table.DISCOUNT_PROGRAM}.start_at`] = start_at;
    }

    if (end_at) {
      filterConditions[`${Table.DISCOUNT_PROGRAM}.end_at`] = end_at;
    }

    if (start_at && end_at) {
      filterConditions[`${Table.DISCOUNT_PROGRAM}.end_at`] = MoreThanOrEqual(
        formatStandardTimeStamp(),
      );
      filterConditions[`${Table.DISCOUNT_PROGRAM}.start_at`] = LessThanOrEqual(
        formatStandardTimeStamp(),
      );
    }

    if (status) {
      filterConditions[`${Table.DISCOUNT_PROGRAM}.status`] = status;
    }

    if (start_at) {
      filterConditions[`${Table.DISCOUNT_PROGRAM}.time_start_at`] =
        time_start_at;
    }

    if (end_at) {
      filterConditions[`${Table.DISCOUNT_PROGRAM}.time_end_at`] = time_end_at;
    }

    if (start_at && end_at) {
      filterConditions[`${Table.DISCOUNT_PROGRAM}.time_end_at`] =
        MoreThanOrEqual(formatStandardTimeStamp());
      filterConditions[`${Table.DISCOUNT_PROGRAM}.time_start_at`] =
        LessThanOrEqual(formatStandardTimeStamp());
    }

    if (priority) {
      filterConditions[`${Table.DISCOUNT_PROGRAM}.priority`] = priority;
    }

    let result = this.discountProgramRepo.find({
      select: '*',
      where: discountProgramsSearchFilter(search, filterConditions),
      orderBy: [
        { field: `${Table.DISCOUNT_PROGRAM}.updated_at`, sortBy: SortBy.DESC },
      ],
      skip,
      limit,
    });

    let count = this.discountProgramRepo.find({
      select: `COUNT(DISTINCT(${Table.DISCOUNT_PROGRAM}.discount_id)) as total`,
      where: discountProgramsSearchFilter(search, filterConditions),
    });

    let dataRepsonse = await Promise.all([result, count]);

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: dataRepsonse[1][0].total,
      },
      data: dataRepsonse[0],
    };
  }

  async getById(discount_id, params: any = {}) {
    const discountProgram = await this.discountProgramRepo.findOne({
      discount_id,
    });
    if (!discountProgram) {
      throw new HttpException(
        'Không tìm thấy nhóm SP phụ kiện khuyến mãi',
        404,
      );
    }
    return discountProgram;
  }

  async getProductsInDiscountProgram(discount_id, params: any = {}) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search, status } = params;

    let filterConditions = {
      [`${Table.DISCOUNT_PROGRAM_DETAIL}.discount_id`]: discount_id,
    };
    if (status) {
      filterConditions[`${Table.DISCOUNT_PROGRAM_DETAIL}.status`] = status;
    }

    let orderFilters = [
      {
        field: `${Table.DISCOUNT_PROGRAM_DETAIL}.position`,
        sortBy: SortBy.ASC,
      },
      {
        field: `${Table.DISCOUNT_PROGRAM_DETAIL}.updated_at`,
        sortBy: SortBy.DESC,
      },
    ];

    let productLists = await this.discountProgramDetailRepo.find({
      select: `*, ${Table.DISCOUNT_PROGRAM_DETAIL}.*`,
      join: productDiscountProgramJoiner,
      where: discountProgramsDetailSearchFilter(search, filterConditions),
      orderBy: orderFilters,
      skip,
      limit,
    });

    let count = await this.discountProgramDetailRepo.find({
      select: `COUNT(DISTINCT(${Table.DISCOUNT_PROGRAM_DETAIL}.product_id)) as total`,
      join: productDiscountProgramJoiner,
      where: discountProgramsDetailSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      data: productLists,
    };
  }

  async update(discount_id, data: UpdateDiscountProgramDto) {
    const discountProgram = await this.discountProgramRepo.findOne({
      discount_id,
    });
    if (!discountProgram) {
      throw new HttpException(
        'Không tìm thấy nhóm SP phụ kiện khuyến mãi',
        404,
      );
    }

    const updateDiscountProgramData = {
      ...this.discountProgramRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
    };

    await this.discountProgramRepo.update(
      { discount_id },
      updateDiscountProgramData,
    );

    if (Object.entries(data).length == 1 && data.status) return;
    if (data.applied_products && data.applied_products.length) {
      for (let aplliedProduct of data.applied_products) {
        const discountProgramDetail =
          await this.discountProgramDetailRepo.findOne({
            detail_id: aplliedProduct.detail_id,
          });

        if (discountProgramDetail.product_id) {
          await this.cache.removeCachedProductById(
            discountProgramDetail.product_id,
          );
        }

        if (!discountProgramDetail) {
          continue;
        }
        const discountProgramDetailData = {
          ...this.discountProgramDetailRepo.setData(aplliedProduct),
          updated_at: formatStandardTimeStamp(),
        };
        await this.discountProgramDetailRepo.update(
          { detail_id: aplliedProduct.detail_id },
          discountProgramDetailData,
        );
      }
    }
  }

  async itgCreateDiscountPrograms(data) {
    const cvtData = convertDiscountProgramFromAppcore(data);
    const discountProgram = await this.discountProgramRepo.findOne({
      appcore_id: cvtData.appcore_id,
    });
    if (discountProgram) {
      throw new HttpException('Chương trình đã tồn tại.', 409);
    }
    const newProgramDiscountData = {
      ...new DiscountProgramEntity(),
      ...this.discountProgramRepo.setData(cvtData),
    };
    const newProgramDiscount = await this.discountProgramRepo.create(
      newProgramDiscountData,
    );

    if (cvtData['details'] && cvtData['details'].length) {
      for (let programDetail of cvtData['details']) {
        const checkExist = await this.discountProgramDetailRepo.findOne({
          product_appcore_id: programDetail['product_appcore_id'],
          discount_id: newProgramDiscount['discount_id'],
        });
        if (checkExist) {
          continue;
        }

        let product = await this.productRepo.findOne({
          product_appcore_id: programDetail['product_appcore_id'],
        });
        const updatedProductPriceData = {
          price: programDetail['selling_price'],
          selling_price_program: programDetail['selling_price'],
          original_price_program: programDetail['original_price'],
          discount_amount_program: programDetail['discount_amount'],
          discount_type: programDetail['discount_type'],
          status_program: cvtData['status'],
          time_start_at: cvtData['time_start_at'],
          time_end_at: cvtData['time_end_at'],
        };
        if (!product) {
          const productData = {
            ...new ProductsEntity(),
            ...this.productRepo.setData(programDetail),
            discount_id: newProgramDiscount['discount_id'],
            slug: convertToSlug(programDetail.product, true),
          };
          product = await this.productRepo.create(productData);
          const productPriceData = {
            ...new ProductPricesEntity(),
            ...this.productPriceRepo.setData(programDetail),
            ...updatedProductPriceData,
            product_id: product.product_id,
          };
          await this.productPriceRepo.create(productPriceData, false);
          const productDescData = {
            ...new ProductDescriptionsEntity(),
            ...this.productDescRepo.setData(programDetail),
            product_id: product.product_id,
          };
          await this.productDescRepo.create(productDescData);
        } else {
          await this.productRepo.update(
            { product_id: product.product_id },
            { discount_id: newProgramDiscount['discount_id'] },
          );
          delete updatedProductPriceData['price'];
          await this.productPriceRepo.update(
            { product_id: product.product_id },
            { ...updatedProductPriceData },
          );
        }

        const newProgramDetail = {
          ...new DiscountProgramDetailEntity(),
          ...this.discountProgramDetailRepo.setData(programDetail),
          discount_id: newProgramDiscount.discount_id,
          product_id: product.product_id,
        };
        await this.discountProgramDetailRepo.create(newProgramDetail);
      }
    }
    return this.getById(newProgramDiscount.discount_id);
  }

  async itgUpdateDiscountPrograms(data) {
    const cvtData = convertDiscountProgramFromAppcore(data);
    const discountProgram = await this.discountProgramRepo.findOne({
      appcore_id: cvtData.appcore_id,
    });

    if (!discountProgram) {
      return this.itgCreateDiscountPrograms(data);
    }

    const programDiscountData = {
      ...this.discountProgramRepo.setData(cvtData),
      updated_at: formatStandardTimeStamp(),
    };
    await this.discountProgramRepo.update(
      { discount_id: discountProgram.discount_id },
      programDiscountData,
    );

    if (cvtData['details'] && cvtData['details'].length) {
      let oldProgramDetails = await this.discountProgramDetailRepo.find({
        discount_id: discountProgram.discount_id,
      });
      if (oldProgramDetails.length) {
        for (let oldProgramDetail of oldProgramDetails) {
          if (oldProgramDetail.product_id) {
            await this.productPriceRepo.update(
              { product_id: oldProgramDetail.product_id },
              {
                selling_price_program: 0,
                time_start_at: null,
                time_end_at: null,
                original_price_program: 0,
                status_program: 'D',
              },
            );
          }
          await this.discountProgramDetailRepo.delete({
            discount_id: discountProgram.discount_id,
          });
        }
      }

      for (let programDetail of cvtData['details']) {
        const checkExist = await this.discountProgramDetailRepo.findOne({
          product_appcore_id: programDetail['product_appcore_id'],
          discount_id: discountProgram['discount_id'],
        });
        if (checkExist) {
          continue;
        }
        let product = await this.productRepo.findOne({
          product_appcore_id: programDetail['product_appcore_id'],
        });
        const updatedProductPriceData = {
          price: programDetail['selling_price'],
          selling_price_program: programDetail['selling_price'],
          original_price_program: programDetail['original_price'],
          discount_amount_program: programDetail['discount_amount'],
          discount_type: programDetail['discount_type'],
          status_program: cvtData['status'],
          time_start_at: cvtData['time_start_at'],
          time_end_at: cvtData['time_end_at'],
        };
        console.log(updatedProductPriceData);
        if (!product) {
          const productData = {
            ...new ProductsEntity(),
            ...this.productRepo.setData(programDetail),
            discount_id: discountProgram['discount_id'],
            slug: convertToSlug(programDetail.product, true),
          };
          product = await this.productRepo.create(productData);
          const productPriceData = {
            ...new ProductPricesEntity(),
            ...this.productPriceRepo.setData(programDetail),
            ...updatedProductPriceData,
            product_id: product.product_id,
          };
          await this.productPriceRepo.create(productPriceData, false);
          const productDescData = {
            ...new ProductDescriptionsEntity(),
            ...this.productDescRepo.setData(programDetail),
            product_id: product.product_id,
          };
          await this.productDescRepo.create(productDescData);
        } else {
          await this.productRepo.update(
            { product_id: product.product_id },
            { discount_id: discountProgram['discount_id'] },
          );
          delete updatedProductPriceData['price'];
          await this.productPriceRepo.update(
            { product_id: product.product_id },
            { ...updatedProductPriceData },
          );
        }

        const newProgramDetailData = {
          ...new DiscountProgramDetailEntity(),
          ...this.discountProgramDetailRepo.setData(programDetail),
          discount_id: discountProgram.discount_id,
          product_id: product.product_id,
        };
        await this.discountProgramDetailRepo.create(newProgramDetailData);
      }
    }
    return this.getById(discountProgram.discount_id);
  }

  async FEGetList() {
    const discountProgramList = await this.discountProgramRepo.find();
    let resDiscountProgramList = [];
    for (let discountProgram of discountProgramList) {
      let appliedProducts = await this.discountProgramDetailRepo.find({
        discount_id: discountProgram.discount_id,
        status: 'A',
      });
      let tempAppliedProducts = [];
      for (let appliedProduct of appliedProducts) {
        const tempAppliedproduct = await this.productRepo.findOne({
          select: getProductListByDiscountProgram,
          join: productLeftJoiner,
          where: {
            [`${Table.PRODUCTS}.product_id`]: appliedProduct.product_id,
          },
        });
        tempAppliedProducts.push(tempAppliedproduct);
      }
      let tempDiscountProgram = {
        ...discountProgram,
        applied_products: tempAppliedProducts,
      };
      resDiscountProgramList.push(tempDiscountProgram);
    }
    return resDiscountProgramList;
  }

  async testCron() {
    await this.addTimeoutTurnOnDiscountProgram(8);
  }

  async addTimeoutTurnOnDiscountProgram(discount_id) {
    const callback = () => {
      this.turnOnDiscountProgram(discount_id);
    };

    const discountProgram = await this.discountProgramRepo.findOne({
      discount_id,
    });

    const startDate = formatStandardTimeStamp(
      discountProgram['start_at'],
    ).toString();
    const endDate = formatStandardTimeStamp(
      discountProgram['end_at'],
    ).toString();
    const today = formatStandardTimeStamp();

    //Không có cả ngày bắt đầu và ngày kết thúc
    if (!discountProgram.start_at && !discountProgram.end_at) {
      const startTime = await this.configTime(discountProgram.time_start_at);
      const endTime = await this.configTime(discountProgram.time_end_at);
      const now = await this.configTime(formatTime());
      if (
        now.toSecond > startTime.toSecond &&
        now.toSecond < endTime.toSecond
      ) {
        console.log('Chương trình được bắt đầu trong khung giờ diễn ra');
        this.discountProgramRepo.update({ discount_id }, { status: 'A' });
      } else {
        console.log('Chương trình được bắt đầu không trong khung giờ diễn ra');
      }

      const jobOn = new CronJob(
        `${startTime.second} ${startTime.minute} ${startTime.hour} * * *`,
        () => {
          this.discountProgramRepo.update({ discount_id }, { status: 'A' });
        },
      );
      const jobOff = new CronJob(
        `${endTime.second} ${endTime.minute} ${endTime.hour} * * *`,
        () => {
          this.discountProgramRepo.update({ discount_id }, { status: 'D' });
        },
      );

      this.schedulerRegistry.addCronJob(
        convertToSlug(discountProgram.discount_name) +
          '-on-at-' +
          convertToSlug(discountProgram.time_start_at),
        jobOn,
      );
      jobOn.start();
      this.schedulerRegistry.addCronJob(
        convertToSlug(discountProgram.discount_name) +
          '-off-at-' +
          convertToSlug(discountProgram.time_end_at),
        jobOff,
      );
      jobOff.start();
      return;
    }

    //Chỉ có ngày bắt đầu
    if (!discountProgram.end_at) {
      if (new Date(today).getTime() > new Date(startDate).getTime()) {
        console.log('Chương trình chiết khấu đang trong thời gian diễn ra.');

        const startTime = await this.configTime(discountProgram.time_start_at);
        const endTime = await this.configTime(discountProgram.time_end_at);
        const now = await this.configTime(formatTime());
        if (
          now.toSecond > startTime.toSecond &&
          now.toSecond < endTime.toSecond
        ) {
          console.log('Chương trình được bắt đầu trong khung giờ diễn ra');
          this.discountProgramRepo.update({ discount_id }, { status: 'A' });
        } else {
          console.log(
            'Chương trình được bắt đầu không trong khung giờ diễn ra',
          );
        }

        const jobOn = new CronJob(
          `${startTime.second} ${startTime.minute} ${startTime.hour} * * *`,
          () => {
            this.discountProgramRepo.update({ discount_id }, { status: 'A' });
          },
        );
        const jobOff = new CronJob(
          `${endTime.second} ${endTime.minute} ${endTime.hour} * * *`,
          () => {
            this.discountProgramRepo.update({ discount_id }, { status: 'D' });
          },
        );

        this.schedulerRegistry.addCronJob(
          convertToSlug(discountProgram.discount_name) +
            '-on-at-' +
            convertToSlug(discountProgram.time_start_at),
          jobOn,
        );
        jobOn.start();
        this.schedulerRegistry.addCronJob(
          convertToSlug(discountProgram.discount_name) +
            '-off-at-' +
            convertToSlug(discountProgram.time_end_at),
          jobOff,
        );
        jobOff.start();
        return;
      }

      const callback = () => {
        this.turnOnDiscountProgram(discount_id);
      };

      const milliseconds =
        new Date(startDate).getTime() - new Date(today).getTime();
      const timeout = setTimeout(callback, milliseconds);
      console.log(
        'Discount program will start after ' +
          milliseconds / 3600000 +
          ' hours.',
      );
      this.schedulerRegistry.addTimeout(
        convertToSlug(discountProgram.discount_name),
        timeout,
      );
      return;
    }

    //Chỉ có ngày kết thúc
    if (!discountProgram.start_at) {
      if (new Date(endDate).getTime() < new Date(today).getTime()) {
        console.log('Chương trình chiết khấu đã quá hạn.');
        return;
      }

      const startTime = await this.configTime(discountProgram.time_start_at);
      const endTime = await this.configTime(discountProgram.time_end_at);
      const now = await this.configTime(formatTime());
      if (
        now.toSecond > startTime.toSecond &&
        now.toSecond < endTime.toSecond
      ) {
        console.log('Chương trình được bắt đầu trong khung giờ diễn ra');
        this.discountProgramRepo.update({ discount_id }, { status: 'A' });
      } else {
        console.log('Chương trình được bắt đầu không trong khung giờ diễn ra');
      }
      const jobOn = new CronJob(
        `${startTime.second} ${startTime.minute} ${startTime.hour} * * *`,
        () => {
          this.discountProgramRepo.update({ discount_id }, { status: 'A' });
        },
      );
      const jobOff = new CronJob(
        `${endTime.second} ${endTime.minute} ${endTime.hour} * * *`,
        () => {
          this.discountProgramRepo.update({ discount_id }, { status: 'D' });
        },
      );

      this.schedulerRegistry.addCronJob(
        convertToSlug(discountProgram.discount_name) +
          '-on-at-' +
          convertToSlug(discountProgram.time_start_at),
        jobOn,
      );
      jobOn.start();
      this.schedulerRegistry.addCronJob(
        convertToSlug(discountProgram.discount_name) +
          '-off-at-' +
          convertToSlug(discountProgram.time_end_at),
        jobOff,
      );
      jobOff.start();
      await this.addTimeoutTurnOffDiscountProgram(discount_id);
      return;
    }

    //Có ngày bắt đầu và ngày kết thúc
    if (new Date(endDate).getTime() < new Date(today).getTime()) {
      console.log('Chương trình chiết khấu đã quá hạn.');
      return;
    }

    if (new Date(today).getTime() > new Date(startDate).getTime()) {
      console.log('Chương trình chiết khấu đang trong thời gian diễn ra.');

      const startTime = await this.configTime(discountProgram.time_start_at);
      const endTime = await this.configTime(discountProgram.time_end_at);
      const now = await this.configTime(formatTime());
      if (
        now.toSecond > startTime.toSecond &&
        now.toSecond < endTime.toSecond
      ) {
        console.log('Chương trình được bắt đầu trong khung giờ diễn ra');
        this.discountProgramRepo.update({ discount_id }, { status: 'A' });
      } else {
        console.log('Chương trình được bắt đầu không trong khung giờ diễn ra');
      }

      const jobOn = new CronJob(
        `${startTime.second} ${startTime.minute} ${startTime.hour} * * *`,
        () => {
          this.discountProgramRepo.update({ discount_id }, { status: 'A' });
        },
      );
      const jobOff = new CronJob(
        `${endTime.second} ${endTime.minute} ${endTime.hour} * * *`,
        () => {
          this.discountProgramRepo.update({ discount_id }, { status: 'D' });
        },
      );

      this.schedulerRegistry.addCronJob(
        'on-at-' + convertToSlug(discountProgram.time_start_at),
        jobOn,
      );
      jobOn.start();
      this.schedulerRegistry.addCronJob(
        'off-at-' + convertToSlug(discountProgram.time_end_at),
        jobOff,
      );
      jobOff.start();

      await this.addTimeoutTurnOffDiscountProgram(discount_id);
      return;
    }

    const milliseconds =
      new Date(startDate).getTime() - new Date(today).getTime();
    const timeout = setTimeout(callback, milliseconds);
    console.log(
      'Discount program will start after ' + milliseconds / 3600000 + ' hours.',
    );
    this.schedulerRegistry.addTimeout(
      convertToSlug(discountProgram.discount_name),
      timeout,
    );
  }

  async configTime(hh_mm_ss) {
    const time = hh_mm_ss.split(':');
    let hour = parseInt(time[0]);
    let minute = parseInt(time[1]);
    let second = parseInt(time[2]);
    let toSecond = hour * 3600 + minute * 60 + second;
    return {
      hour,
      minute,
      second,
      toSecond,
    };
  }

  async turnOnDiscountProgram(discount_id) {
    console.log('Discount program start');
    const discountProgram = await this.discountProgramRepo.findOne({
      discount_id,
    });

    const startTime = await this.configTime(discountProgram.time_start_at);
    const endTime = await this.configTime(discountProgram.time_end_at);
    const now = await this.configTime(formatTime());
    if (now.toSecond > startTime.toSecond && now.toSecond < endTime.toSecond) {
      console.log('Chương trình được bắt đầu trong khung giờ diễn ra');
      this.discountProgramRepo.update({ discount_id }, { status: 'A' });
    } else {
      console.log('Chương trình được bắt đầu không trong khung giờ diễn ra');
    }

    const jobOn = new CronJob(
      `${startTime.second} ${startTime.minute} ${startTime.hour} * * *`,
      () => {
        this.discountProgramRepo.update({ discount_id }, { status: 'A' });
      },
    );
    const jobOff = new CronJob(
      `${endTime.second} ${endTime.minute} ${endTime.hour} * * *`,
      () => {
        this.discountProgramRepo.update({ discount_id }, { status: 'D' });
      },
    );

    this.schedulerRegistry.addCronJob(
      convertToSlug(discountProgram.discount_name) +
        '-on-at-' +
        convertToSlug(discountProgram.time_start_at),
      jobOn,
    );
    jobOn.start();
    this.schedulerRegistry.addCronJob(
      convertToSlug(discountProgram.discount_name) +
        '-off-at-' +
        convertToSlug(discountProgram.time_end_at),
      jobOff,
    );
    jobOff.start();

    await this.schedulerRegistry.deleteTimeout(
      convertToSlug(discountProgram.discount_name),
    );

    if (discountProgram.end_at) {
      await this.addTimeoutTurnOffDiscountProgram(discount_id);
    }
  }

  async addTimeoutTurnOffDiscountProgram(discount_id) {
    const callback = () => {
      this.turnOffDiscountProgram(discount_id);
    };

    const discountProgram = await this.discountProgramRepo.findOne({
      discount_id,
    });
    const endDate = formatStandardTimeStamp(
      discountProgram['end_at'],
    ).toString();
    const today = formatStandardTimeStamp();
    const milliseconds =
      new Date(endDate).getTime() - new Date(today).getTime();
    const timeout = setTimeout(callback, milliseconds);
    console.log(
      'Discount program will end after ' + milliseconds / 3600000 + ' hours.',
    );
    this.schedulerRegistry.addTimeout(
      convertToSlug(discountProgram.discount_name),
      timeout,
    );
  }

  async turnOffDiscountProgram(discount_id) {
    console.log('Turn off discount program');
    const discountProgram = await this.discountProgramRepo.findOne({
      discount_id,
    });

    this.schedulerRegistry.deleteCronJob(
      convertToSlug(discountProgram.discount_name) +
        '-on-at-' +
        convertToSlug(discountProgram.time_start_at),
    );
    this.schedulerRegistry.deleteCronJob(
      convertToSlug(discountProgram.discount_name) +
        '-off-at-' +
        convertToSlug(discountProgram.time_end_at),
    );
    this.logger.warn(
      `job ${
        convertToSlug(discountProgram.discount_name) +
        '-on-at-' +
        convertToSlug(discountProgram.time_start_at)
      } deleted!`,
    );
    this.logger.warn(
      `job ${
        convertToSlug(discountProgram.discount_name) +
        '-off-at-' +
        convertToSlug(discountProgram.time_end_at)
      } deleted!`,
    );

    this.discountProgramRepo.update({ discount_id }, { status: 'D' });

    await this.schedulerRegistry.deleteTimeout(
      convertToSlug(discountProgram.discount_name),
    );
    await this.logger.warn(
      `Timeout ${convertToSlug(discountProgram.discount_name)} deleted!`,
    );
  }
}
