import { Table } from 'src/database/enums';
import { ProductDescriptionsRepository } from './../repositories/productDescriptions.respository';
import { ProductPricesRepository } from './../repositories/productPrices.repository';
import { ProductsRepository } from './../repositories/products.repository';
import { Injectable, HttpException } from '@nestjs/common';
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
import { getProductAccessorySelector, getProductListByDiscountProgram } from '../../utils/tableSelector';
import {
  discountProgramsSearchFilter,
  discountProgramsDetailSearchFilter,
} from '../../utils/tableConditioner';
import { UpdateDiscountProgramDto } from '../dto/discountProgram/update-discountProgram.dto';
import { SortBy } from '../../database/enums/sortBy.enum';
import { CacheRepository } from '../repositories/cache.repository';
import { RedisCacheService } from './redisCache.service';
import { productLeftJoiner } from '../../utils/joinTable';
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
  constructor(
    private discountProgramRepo: DiscountProgramRepository<DiscountProgramEntity>,
    private discountProgramDetailRepo: DiscountProgramDetailRepository<DiscountProgramDetailEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private productPriceRepo: ProductPricesRepository<ProductPricesEntity>,
    private productDescRepo: ProductDescriptionsRepository<ProductDescriptionsEntity>,
    private cache: RedisCacheService,
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

    const result = await this.discountProgramRepo.find({
      select: '*',
      where: discountProgramsSearchFilter(search, filterConditions),
      orderBy: [
        { field: `${Table.DISCOUNT_PROGRAM}.updated_at`, sortBy: SortBy.DESC },
      ],
      skip,
      limit,
    });

    const count = await this.discountProgramRepo.find({
      select: `COUNT(DISTINCT(${Table.DISCOUNT_PROGRAM}.discount_id)) as total`,
      where: discountProgramsSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      data: result,
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
    const discountProgramList = await this.discountProgramRepo.find({status: 'A'});
    let resDiscountProgramList = [];
    for (let discountProgram of discountProgramList) {
      let appliedProducts = await this.discountProgramDetailRepo.find({discount_id: discountProgram.discount_id, status: 'A'});
      let tempAppliedProducts = []
      for (let appliedProduct of appliedProducts) {
        const tempAppliedproduct = await this.productRepo.findOne({
          select: getProductListByDiscountProgram,
          join: productLeftJoiner,
          where: { [`${Table.PRODUCTS}.product_id`]: appliedProduct.product_id },
        });
        tempAppliedProducts.push(tempAppliedproduct);
      }
      let tempDiscountProgram = {...discountProgram, applied_products: tempAppliedProducts}
      resDiscountProgramList.push(tempDiscountProgram);
    }
    return resDiscountProgramList;
  }
}
