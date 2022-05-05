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
import { CreateTradeinProgramDto } from '../dto/tradein/create-tradeinProgram.dto';
import { TradeinProgramCriteriaDetailRepository } from '../repositories/tradeinProgramCriteriaDetail.repository';
import { TradeinProgramCriteriaDetailEntity } from '../entities/tradeinProgramCriteriaDetail.entity';
import { UpdateTradeinProgramDto } from '../dto/tradein/update-tradeinProgram.dto';
import {
  LessThanOrEqual,
  MoreThanOrEqual,
} from '../../database/operators/operators';
import { ValuationBillRepository } from '../repositories/valuationBill.repository';
import { ValuationBillEntity } from '../entities/valuationBill.entity';
import { ValuationBillCriteriaDetailRepository } from '../repositories/valuationBillCriteriaDetail.repository';
import { ValuationBillCriteriaDetailEntity } from '../entities/valuationBillCriteriaDetail.entity';

export class TradeinProgramService {
  constructor(
    private tradeinProgramRepo: TradeinProgramRepository<TradeinProgramEntity>,
    private tradeinProgramDetailRepo: TradeinProgramDetailRepository<TradeinProgramDetailEntity>,
    private tradeinProgramCriteriaRepo: TradeinProgramCriteriaRepository<TradeinProgramCriteriaEntity>,
    private tradeinProgramCriteriaDetailRepo: TradeinProgramCriteriaDetailRepository<TradeinProgramCriteriaDetailEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private valuationBillRepo: ValuationBillRepository<ValuationBillEntity>,
    private valuationBillCriteriaDetailRepo: ValuationBillCriteriaDetailRepository<ValuationBillCriteriaDetailEntity>,
  ) {}
  async cmsCreate(data: CreateTradeinProgramDto, user) {
    const tradeinProgramData = {
      ...new TradeinProgramEntity(),
      ...this.tradeinProgramRepo.setData(data),
      created_by: user.user_id,
      updated_by: user.user_id,
    };
    const newTradeinProgram = await this.tradeinProgramRepo.create(
      tradeinProgramData,
    );

    if (data.applied_products && data.applied_products.length) {
      await this.tradeinProgramDetailRepo.delete({
        tradein_id: newTradeinProgram.tradein_id,
      });
      for (let tradeinDetail of data.applied_products) {
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

    if (data.applied_criteria && data.applied_criteria.length) {
      for (let appliedCriteriaItem of data.applied_criteria) {
        const newCriteriaData = {
          ...new TradeinProgramCriteriaDetailEntity(),
          ...this.tradeinProgramCriteriaRepo.setData(appliedCriteriaItem),
          tradein_id: newTradeinProgram.tradein_id,
        };
        const newCriteria = await this.tradeinProgramCriteriaRepo.create(
          newCriteriaData,
        );

        if (
          appliedCriteriaItem.applied_criteria_detail &&
          appliedCriteriaItem.applied_criteria_detail.length
        ) {
          for (let criteriaDetailItem of appliedCriteriaItem.applied_criteria_detail) {
            let newCriteriaDetailData = {
              ...new TradeinProgramCriteriaDetailEntity(),
              ...this.tradeinProgramCriteriaDetailRepo.setData(
                criteriaDetailItem,
              ),
              criteria_id: newCriteria.criteria_id,
            };

            await this.tradeinProgramCriteriaDetailRepo.create(
              newCriteriaDetailData,
            );
          }
        }
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

  async getListFE(params) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search } = params;
    let filterCondition = {
      [`${Table.TRADEIN_PROGRAM}.status`]: 'A',
      [`${Table.TRADEIN_PROGRAM}.start_at`]: LessThanOrEqual(
        formatStandardTimeStamp(),
      ),
      [`${Table.TRADEIN_PROGRAM}.end_at`]: MoreThanOrEqual(
        formatStandardTimeStamp(),
      ),
    };

    let tradeinProgramsList = await this.tradeinProgramRepo.findOne({
      select: '*',
      where: tradeinProgramSearchFilter(search, filterCondition),
      orderBy: [
        { field: `${Table.TRADEIN_PROGRAM}.updated_at`, sortBy: SortBy.DESC },
      ],
      skip,
      limit,
    });

    if (tradeinProgramsList) {
      for (let tradeinProgram of tradeinProgramsList) {
        let aplliedProducts = await this.tradeinProgramDetailRepo.find({
          select: '*',
          join: tradeinDetailLeftJoiner,
          where: {
            [`${Table.TRADEIN_PROGRAM_DETAIL}.tradein_id`]:
              tradeinProgram.tradein_id,
            [`${Table.TRADEIN_PROGRAM_DETAIL}.detail_status`]: 'A',
          },
        });
        tradeinProgram['appliedProducts'] = aplliedProducts;

        let appliedCriteriaList = await this.tradeinProgramCriteriaRepo.find({
          tradein_id: tradeinProgram.tradein_id,
          criteria_status: 'A',
        });
        if (appliedCriteriaList.length) {
          for (let appliedCriteriaItem of appliedCriteriaList) {
            const appliedCriteriaDetails =
              await this.tradeinProgramCriteriaDetailRepo.find({
                criteria_id: appliedCriteriaItem.criteria_id,
              });
            appliedCriteriaItem['criteriaDetails'] = appliedCriteriaDetails;
          }
        }
        tradeinProgram['appliedCriteria'] = appliedCriteriaList;
      }
    }

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

  async createValuationBill(data) {
    let valuationBillData = {
      ...new ValuationBillCriteriaDetailEntity(),
      ...this.valuationBillRepo.setData(data),
    };

    const newValuationBill = await this.valuationBillRepo.create(
      valuationBillData,
    );

    if (data.valuation_criteria_list && data.valuation_criteria_list.length) {
      for (let criteriaId of data.valuation_criteria_list) {
        const valuationBillCriteriaDetailData = {
          ...new ValuationBillCriteriaDetailEntity(),
          ...this.valuationBillCriteriaDetailRepo.setData(data),
          valuation_bill_id: newValuationBill.valuation_bill_id,
          criteria_detail_id: criteriaId,
        };
        await this.valuationBillCriteriaDetailRepo.create(
          valuationBillCriteriaDetailData,
        );
      }
    }
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

    let tradeinCriteriaList = await this.tradeinProgramCriteriaRepo.find({
      tradein_id,
    });

    if (tradeinCriteriaList.length) {
      for (let tradeinCriteriaItem of tradeinCriteriaList) {
        const tradeinCriteriaDetails =
          await this.tradeinProgramCriteriaDetailRepo.find({
            select: '*',
            where: {
              [`${Table.TRADEIN_PROGRAM_CRITERIA_DETAIL}.criteria_id`]:
                tradeinCriteriaItem.criteria_id,
            },
          });

        tradeinCriteriaItem['criteriaDetails'] = tradeinCriteriaDetails;
      }
    }

    let detailResult = {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      data: tradeinDetails,
    };

    tradein['tradein_details'] = detailResult;
    tradein['criteria'] = tradeinCriteriaList;
    return tradein;
  }

  async update(tradein_id: number, data: UpdateTradeinProgramDto, user) {
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

    if (data.removed_products && data.removed_products.length) {
      for (let removedProductId of data.removed_products) {
        await this.tradeinProgramDetailRepo.delete({
          tradein_id,
          product_id: removedProductId,
        });
      }
    }

    if (data.applied_products && data.applied_products.length) {
      for (let appliedProductItem of data.applied_products) {
        let checkProductExist = await this.tradeinProgramDetailRepo.findOne({
          tradein_id,
          product_id: appliedProductItem.product_id,
        });
        if (checkProductExist) {
          const updateTradeinProductData = {
            ...this.tradeinProgramDetailRepo.setData(appliedProductItem),
            updated_at: formatStandardTimeStamp(),
          };
          if (Object.entries(updateTradeinProductData).length) {
            await this.tradeinProgramDetailRepo.update(
              { tradein_id, product_id: appliedProductItem.product_id },
              updateTradeinProductData,
            );
          }
        } else {
          const newTradeinProductData = {
            ...new TradeinProgramDetailEntity(),
            ...this.tradeinProgramDetailRepo.setData(appliedProductItem),
            tradein_id,
          };
          await this.tradeinProgramDetailRepo.create(newTradeinProductData);
        }
      }
    }

    if (data.removed_criteria && data.removed_criteria.length) {
      for (let removedCriteriaId of data.removed_criteria) {
        await this.tradeinProgramCriteriaRepo.delete({
          criteria_id: removedCriteriaId,
        });
        await this.tradeinProgramCriteriaDetailRepo.delete({
          criteria_id: removedCriteriaId,
        });
      }
    }

    if (data.applied_criteria && data.applied_criteria.length) {
      for (let appliedCriteriaItem of data.applied_criteria) {
        let checkCriteriaExist = await this.tradeinProgramCriteriaRepo.findOne({
          tradein_id,
          criteria_id: appliedCriteriaItem.criteria_id,
        });
        if (checkCriteriaExist) {
          const updateCriteriaData = {
            ...this.tradeinProgramCriteriaRepo.setData(appliedCriteriaItem),
            updated_at: formatStandardTimeStamp(),
          };
          await this.tradeinProgramCriteriaRepo.update(
            { tradein_id, criteria_id: appliedCriteriaItem.criteria_id },
            updateCriteriaData,
          );
        } else {
          const newCriteriaData = {
            ...new TradeinProgramCriteriaEntity(),
            ...this.tradeinProgramCriteriaRepo.setData(appliedCriteriaItem),
            tradein_id,
          };
          await this.tradeinProgramCriteriaRepo.create(newCriteriaData);
        }

        if (
          appliedCriteriaItem.removed_criteria_detail &&
          appliedCriteriaItem.removed_criteria_detail.length
        ) {
          for (let removedCriteriaDetailId of appliedCriteriaItem.removed_criteria_detail) {
            await this.tradeinProgramCriteriaDetailRepo.delete({
              criteria_detail_id: removedCriteriaDetailId,
            });
          }
        }

        if (
          appliedCriteriaItem.applied_criteria_detail &&
          appliedCriteriaItem.applied_criteria_detail.length &&
          appliedCriteriaItem.criteria_id
        ) {
          for (let appliedCriteriaDetailItem of appliedCriteriaItem.applied_criteria_detail) {
            let checkCriteriaDetailExist =
              await this.tradeinProgramCriteriaDetailRepo.findOne({
                criteria_id: appliedCriteriaItem.criteria_id,
                criteria_detail_id:
                  appliedCriteriaDetailItem.criteria_detail_id,
              });
            if (checkCriteriaDetailExist) {
              let updateCriteriaDetailData =
                this.tradeinProgramCriteriaDetailRepo.setData(
                  appliedCriteriaDetailItem,
                );
              if (Object.entries(updateCriteriaDetailData).length) {
                await this.tradeinProgramCriteriaDetailRepo.update(
                  {
                    criteria_id: appliedCriteriaItem.criteria_id,
                    criteria_detail_id:
                      appliedCriteriaDetailItem.criteria_detail_id,
                  },
                  updateCriteriaDetailData,
                );
              }
            } else {
              let newCriteriaDetailData = {
                ...new TradeinProgramCriteriaDetailEntity(),
                ...this.tradeinProgramCriteriaDetailRepo.setData(
                  appliedCriteriaDetailItem,
                ),
                criteria_id: appliedCriteriaItem.criteria_id,
              };
              await this.tradeinProgramCriteriaDetailRepo.create(
                newCriteriaDetailData,
              );
            }
          }
        }
      }
    }

    return this.get(tradein_id);
  }
}
