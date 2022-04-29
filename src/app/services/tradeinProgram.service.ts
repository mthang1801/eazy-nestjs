import { TradeinProgramEntity } from '../entities/tradeinProgram.entity';
import { TradeinProgramRepository } from '../repositories/tradeinProgram.repository';
import { TradeinProgramDetailRepository } from '../repositories/tradeinProgramDetail.repository';
import { TradeinProgramDetailEntity } from '../entities/tradeinProgramDetail.entity';
import { TradeinProgramCriteriaRepository } from '../repositories/tradeinProgramCriteria.repository';
import { TradeinProgramCriteriaEntity } from '../entities/tradeinProgramCriteria.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import {
  productLeftJoiner,
  tradeinDetailLeftJoiner,
} from '../../utils/joinTable';
import { Table } from 'src/database/enums';
import { HttpException } from '@nestjs/common';
import { getPageSkipLimit, formatStandardTimeStamp } from '../../utils/helper';
import {
  tradeinProgramSearchFilter,
  tradeinProgramDetailSearchFilter,
} from '../../utils/tableConditioner';
import { SortBy } from '../../database/enums/sortBy.enum';

export class TradeinProgramService {
  constructor(
    private tradeinProgramRepo: TradeinProgramRepository<TradeinProgramEntity>,
    private tradeinProgramDetailRepo: TradeinProgramDetailRepository<TradeinProgramDetailEntity>,
    private tradeinProgramCriteriaRepo: TradeinProgramCriteriaRepository<TradeinProgramCriteriaEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
  ) {}
  async cmsCreate(data, user) {
    const tradeinProgramData = {
      ...new TradeinProgramEntity(),
      ...this.tradeinProgramRepo.setData(data),
      created_by: user.user_id,
      updated_by: user.user_id,
    };
    const newTradeinProgram = await this.tradeinProgramRepo.create(
      tradeinProgramData,
    );

    if (data.tradein_details && data.tradein_details.length) {
      await this.tradeinProgramDetailRepo.delete({
        tradein_id: newTradeinProgram.tradein_id,
      });
      for (let tradeinDetail of data.tradein_details) {
        const product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: { [`${Table.PRODUCTS}.product_id`]: tradeinDetail.product_id },
        });
        if (!product) {
          continue;
        }
        const tradeinDetailData = {
          ...new TradeinProgramDetailEntity(),
          ...this.tradeinProgramDetailRepo.setData(tradeinDetail),
          product_appcore_id: product.product_appcore_id,
          tradein_id: newTradeinProgram.tradein_id,
        };
        await this.tradeinProgramDetailRepo.create(tradeinDetailData);
      }
    }
    return this.get(newTradeinProgram.tradein_id);
  }

  async getList(params) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search } = params;
    let filterCondition = {};

    let tradeinProgramsList = await this.tradeinProgramRepo.find({
      select: '*',
      where: tradeinProgramSearchFilter(search, filterCondition),
      orderBy: [
        { field: `${Table.TRADEIN_PROGRAM}.updated_at`, sortBy: SortBy.DESC },
      ],
      skip,
      limit,
    });

    let count = await this.tradeinProgramRepo.find({
      select: `COUNT(DISTINCT(${Table.TRADEIN_PROGRAM}.tradein_id)) as total `,
      where: tradeinProgramSearchFilter(search, filterCondition),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      data: tradeinProgramsList,
    };
  }

  async get(tradein_id: number, params: any = {}) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search } = params;
    const tradein = await this.tradeinProgramRepo.findOne({ tradein_id });
    if (!tradein) {
      throw new HttpException('Không tìm thấy chương trình.', 404);
    }

    let filterCondition = {};
    const tradeinDetails = await this.tradeinProgramDetailRepo.find({
      select: '*',
      join: tradeinDetailLeftJoiner,
      where: tradeinProgramDetailSearchFilter(search, filterCondition),
      orderBy: [
        {
          field: `${Table.TRADEIN_PROGRAM_DETAIL}.updated_at`,
          sortBy: SortBy.DESC,
        },
      ],
      skip,
      limit,
    });

    let count = await this.tradeinProgramDetailRepo.find({
      select: `COUNT(${Table.TRADEIN_PROGRAM_DETAIL}.detail_id) as total`,
      join: tradeinDetailLeftJoiner,
      where: tradeinProgramDetailSearchFilter(search, filterCondition),
    });

    let detailResult = {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      data: tradeinDetails,
    };

    tradein['tradein_details'] = detailResult;
    return tradein;
  }

  async update(tradein_id, data, user) {
    const currentTradein = await this.tradeinProgramRepo.findOne({
      tradein_id,
    });
    if (!currentTradein) {
      throw new HttpException('Không tìm thấy chương trình', 404);
    }

    const updateTradeinData = {
      ...this.tradeinProgramRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
      updated_by: user.user_id,
    };
    await this.tradeinProgramRepo.update({ tradein_id }, updateTradeinData);

    if (data.inserted_products && data.inserted_products.length) {
      for (let insertedProductId of data.inserted_products) {
        let checkExist = await this.tradeinProgramDetailRepo.findOne({
          product_id: insertedProductId,
          tradein_id,
        });
        if (checkExist) {
          continue;
        }

        const product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: {
            [`${Table.PRODUCTS}.product_id`]: insertedProductId,
          },
        });
        if (!product) {
          continue;
        }
        const tradeinDetailData = {
          ...new TradeinProgramDetailEntity(),
          product_id: insertedProductId,
          product_appcore_id: product.product_appcore_id,
          tradein_id,
        };
        await this.tradeinProgramDetailRepo.create(tradeinDetailData);
      }
    }

    if (data.removed_products && data.removed_products.length) {
      for (let removedProductId of data.removed_products) {
        await this.tradeinProgramDetailRepo.delete({
          tradein_id,
          product_id: removedProductId,
        });
      }
    }
    return this.get(tradein_id);
  }
}
