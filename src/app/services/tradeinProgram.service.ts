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
import { HttpException, Injectable } from '@nestjs/common';
import {
  getPageSkipLimit,
  formatStandardTimeStamp,
  convertToSlug,
} from '../../utils/helper';
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
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import {
  userJoiner,
  tradeinOldReceiptJoiner,
  storeLocationJoiner,
} from '../../utils/joinTable';
import { userSelector } from '../../utils/tableSelector';
import { ProductPricesRepository } from '../repositories/productPrices.repository';
import { ProductPricesEntity } from '../entities/productPrices.entity';
import {
  convertTradeinProgramFromAppcore,
  convertTradeinProgramOldReceiptFromAppcore,
} from '../../utils/integrateFunctions';
import { ProductDescriptionsRepository } from '../repositories/productDescriptions.respository';
import { ProductDescriptionsEntity } from '../entities/productDescriptions.entity';
import { TradeinOldReceiptRepository } from '../repositories/tradeinOldReceipt.repository';
import { TradeinOldReceiptEntity } from '../entities/tradeinOldReceipt.entity';
import { TradeinOldReceiptDetailRepository } from '../repositories/tradeinOldReceiptDetail.repository';
import { TradeinOldReceiptDetailEntity } from '../entities/tradeinOldReceiptDetail.entity';
import { ProductsCategoriesEntity } from '../entities/productsCategories.entity';
import { ProductsCategoriesRepository } from '../repositories/productsCategories.repository';
import { tradeinOldReceiptSearchFilter } from '../../utils/tableConditioner';
import { StoreLocationRepository } from '../repositories/storeLocation.repository';
import { StoreLocationEntity } from '../entities/storeLocation.entity';
@Injectable()
export class TradeinProgramService {
  constructor(
    private tradeinProgramRepo: TradeinProgramRepository<TradeinProgramEntity>,
    private tradeinProgramDetailRepo: TradeinProgramDetailRepository<TradeinProgramDetailEntity>,
    private tradeinProgramCriteriaRepo: TradeinProgramCriteriaRepository<TradeinProgramCriteriaEntity>,
    private tradeinProgramCriteriaDetailRepo: TradeinProgramCriteriaDetailRepository<TradeinProgramCriteriaDetailEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private productPriceRepo: ProductPricesRepository<ProductPricesEntity>,
    private valuationBillRepo: ValuationBillRepository<ValuationBillEntity>,
    private valuationBillCriteriaDetailRepo: ValuationBillCriteriaDetailRepository<ValuationBillCriteriaDetailEntity>,
    private productDescRepo: ProductDescriptionsRepository<ProductDescriptionsEntity>,
    private userRepo: UserRepository<UserEntity>,
    private tradeinOldReceiptRepo: TradeinOldReceiptRepository<TradeinOldReceiptEntity>,
    private tradeinOldReceiptDetailRepo: TradeinOldReceiptDetailRepository<TradeinOldReceiptDetailEntity>,
    private productCategoryRepo: ProductsCategoriesRepository<ProductsCategoriesEntity>,
    private storeLocationRepo: StoreLocationRepository<StoreLocationEntity>,
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

        await this.tradeinProgramDetailRepo.create(tradeinDetailData, false);
      }
    }

    if (data.applied_criteria && data.applied_criteria.length) {
      for (let appliedCriteriaItem of data.applied_criteria) {
        const newCriteriaData = {
          ...new TradeinProgramCriteriaEntity(),
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
              false,
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
      select: `*`,
      where: tradeinProgramSearchFilter(search, filterCondition),
      orderBy: [
        { field: `${Table.TRADEIN_PROGRAM}.updated_at`, sortBy: SortBy.DESC },
      ],
      skip,
      limit,
    });

    if (tradeinProgramsList.length) {
      for (let tradeinProgram of tradeinProgramsList) {
        tradeinProgram['last_updater'] = null;
        if (tradeinProgram.updated_by) {
          let user = await this.userRepo.findOne({
            user_id: tradeinProgram.updated_by,
          });
          tradeinProgram['last_updater'] = user;
        }
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

  async getOldReceiptsList(params) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search } = params;
    let filterConditions = {};
    let oldReceiptsList = await this.tradeinOldReceiptRepo.find({
      select: `DISTINCT(${Table.TRADEIN_OLD_RECEIPT}.old_receipt_id), code, store_id, description, created_at, created_by`,
      join: tradeinOldReceiptJoiner,
      where: tradeinOldReceiptSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    if (oldReceiptsList.length) {
      for (let oldReceiptItem of oldReceiptsList) {
        if (oldReceiptItem['store_id']) {
          let store = await this.storeLocationRepo.findOne({
            select: '*',
            join: storeLocationJoiner,
            where: {
              [`${Table.STORE_LOCATIONS}.store_location_id`]:
                oldReceiptItem['store_id'],
            },
          });
          oldReceiptItem['store'] = store;
        }
      }
    }

    let count = await this.tradeinOldReceiptRepo.find({
      select: `COUNT(DISTINCT(${Table.TRADEIN_OLD_RECEIPT}.old_receipt_id)) as total`,
      join: tradeinOldReceiptJoiner,
      where: tradeinOldReceiptSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      data: oldReceiptsList,
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

    let tradeinProgram = await this.tradeinProgramRepo.findOne({
      select: '*',
      where: tradeinProgramSearchFilter(search, filterCondition),
      orderBy: [
        { field: `${Table.TRADEIN_PROGRAM}.updated_at`, sortBy: SortBy.DESC },
      ],
      skip,
      limit,
    });

    let appliedProducts = [];
    let appliedCriteriaList = [];
    let count = 0;
    if (tradeinProgram) {
      appliedProducts = await this.tradeinProgramDetailRepo.find({
        select: '*',
        join: tradeinDetailLeftJoiner,
        where: {
          [`${Table.TRADEIN_PROGRAM_DETAIL}.tradein_id`]:
            tradeinProgram.tradein_id,
          [`${Table.TRADEIN_PROGRAM_DETAIL}.detail_status`]: 'A',
        },
        skip,
        limit,
      });

      let _count = await this.tradeinProgramDetailRepo.find({
        select: `COUNT(${Table.TRADEIN_PROGRAM_DETAIL}.product_id) as total`,
        join: tradeinDetailLeftJoiner,
        where: {
          [`${Table.TRADEIN_PROGRAM_DETAIL}.tradein_id`]:
            tradeinProgram.tradein_id,
          [`${Table.TRADEIN_PROGRAM_DETAIL}.detail_status`]: 'A',
        },
      });

      if (_count[0].total) {
        count = _count[0].total;
      }

      appliedCriteriaList = await this.tradeinProgramCriteriaRepo.find({
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
    }

    return {
      productsPaging: {
        currentPage: page,
        pageSize: limit,
        total: count,
      },
      tradeinProgram,
      appliedProducts,
      appliedCriteriaList,
    };
  }

  async createValuationBill(data) {
    // Kiểm tra điều kiên tại đây trước
    // Tạo 1 biến temp để lưu các core_id trong quá trình check để khỏi check lại khi vào vòng lặp

    let valuationBillData = {
      ...new ValuationBillEntity(),
      ...this.valuationBillRepo.setData(data),
    };

    const newValuationBill = await this.valuationBillRepo.create(
      valuationBillData,
    );

    if (data.valuation_criteria_list && data.valuation_criteria_list.length) {
      for (let {
        criteria_id,
        criteria_detail_id,
      } of data.valuation_criteria_list) {
        const valuationBillCriteriaDetailData = {
          ...new ValuationBillCriteriaDetailEntity(),
          ...this.valuationBillCriteriaDetailRepo.setData(data),
          valuation_bill_id: newValuationBill.valuation_bill_id,
          criteria_detail_id,
          criteria_id,
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

    let filterCondition = {
      [`${Table.TRADEIN_PROGRAM_DETAIL}.tradein_id`]: tradein_id,
    };
    const tradeinDetails = await this.tradeinProgramDetailRepo.find({
      select: `*, ${Table.TRADEIN_PROGRAM_DETAIL}.position, ${Table.TRADEIN_PROGRAM_DETAIL}.product_id`,
      join: tradeinDetailLeftJoiner,
      where: tradeinProgramDetailSearchFilter(search, filterCondition),
      orderBy: [
        {
          field: `${Table.TRADEIN_PROGRAM_DETAIL}.position`,
          sortBy: SortBy.DESC,
        },
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
      select: '*',
      where: {
        tradein_id,
      },
      orderBy: [
        {
          field: `${Table.TRADEIN_PROGRAM_CRITERIA}.position`,
          sortBy: SortBy.ASC,
        },
      ],
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

        tradeinCriteriaItem['applied_criteria_detail'] = tradeinCriteriaDetails;
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
        if (isNaN(+removedProductId)) {
          continue;
        }
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
        if (isNaN(+removedCriteriaId)) {
          continue;
        }
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
        if (isNaN(+appliedCriteriaItem.criteria_id)) {
          appliedCriteriaItem.criteria_id = '0';
        }
        let currentCriteria = await this.tradeinProgramCriteriaRepo.findOne({
          tradein_id,
          criteria_id: appliedCriteriaItem.criteria_id,
        });

        if (currentCriteria) {
          const updateCriteriaData = {
            ...this.tradeinProgramCriteriaRepo.setData(appliedCriteriaItem),
            updated_at: formatStandardTimeStamp(),
          };
          currentCriteria = await this.tradeinProgramCriteriaRepo.update(
            { tradein_id, criteria_id: appliedCriteriaItem.criteria_id },
            updateCriteriaData,
            true,
          );
        } else {
          const newCriteriaData = {
            ...new TradeinProgramCriteriaEntity(),
            ...this.tradeinProgramCriteriaRepo.setData(appliedCriteriaItem),
            tradein_id,
            criteria_id: appliedCriteriaItem.criteria_id,
          };
          currentCriteria = await this.tradeinProgramCriteriaRepo.create(
            newCriteriaData,
          );
        }

        if (
          appliedCriteriaItem.removed_criteria_detail &&
          appliedCriteriaItem.removed_criteria_detail.length
        ) {
          for (let removedCriteriaDetailId of appliedCriteriaItem.removed_criteria_detail) {
            if (isNaN(+removedCriteriaDetailId)) {
              continue;
            }
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
            if (isNaN(+appliedCriteriaDetailItem.criteria_detail_id)) {
              appliedCriteriaDetailItem.criteria_detail_id = '0';
            }
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

  async itgCreate(data) {
    const cvtData: any = convertTradeinProgramFromAppcore(data);

    const checkTradeinExist = await this.tradeinProgramRepo.findOne({
      tradein_appcore_id: cvtData.tradein_appcore_id,
    });
    if (checkTradeinExist) {
      throw new HttpException('Chương trình đã được áp dụng với id này.', 409);
    }

    const tradeinProgramData = {
      ...new TradeinProgramEntity(),
      ...this.tradeinProgramRepo.setData(cvtData),
    };

    const newTradeinProgram = await this.tradeinProgramRepo.create(
      tradeinProgramData,
    );
    if (cvtData.applied_products && cvtData.applied_products.length) {
      await this.tradeinProgramDetailRepo.delete({
        tradein_id: newTradeinProgram.tradein_id,
      });
      for (let tradeinDetail of cvtData.applied_products) {
        let product = await this.productRepo.findOne({
          select: `*, ${Table.PRODUCTS}.product_id`,
          join: productLeftJoiner,
          where: {
            [`${Table.PRODUCTS}.product_appcore_id`]:
              tradeinDetail.product_appcore_id,
          },
        });

        if (!product) {
          const newProductData = {
            ...new ProductsEntity(),
            ...this.productRepo.setData(tradeinDetail),
            slug: convertToSlug(tradeinDetail.product),
          };
          product = await this.productRepo.create(newProductData);

          let productDescData = {
            ...new ProductDescriptionsEntity(),
            ...this.productDescRepo.setData(tradeinDetail),
            product_id: product.product_id,
          };
          await this.productDescRepo.create(productDescData, false);

          let newProductCategoryData = {
            ...new ProductsCategoriesEntity(),
            ...this.productCategoryRepo.setData(tradeinDetail),
            category_id: 1,
            product_id: product['product_id'],
          };
          await this.productCategoryRepo.create(newProductCategoryData, false);
        }

        let productPrice = await this.productPriceRepo.findOne({
          product_id: product['product_id'],
        });

        if (productPrice) {
          await this.productPriceRepo.update(
            { product_id: product.product_id },
            {
              collect_price: tradeinDetail.collect_price,
              price: tradeinDetail.price,
            },
          );
        } else {
          await this.productPriceRepo.create({
            product_id: product.product_id,
            collect_price: tradeinDetail.collect_price,
            price: tradeinDetail.price,
          });
        }

        const tradeinDetailData = {
          ...new TradeinProgramDetailEntity(),
          ...this.tradeinProgramDetailRepo.setData(tradeinDetail),
          product_id: product.product_id,
          tradein_id: newTradeinProgram.tradein_id,
        };
        await this.tradeinProgramDetailRepo.create(tradeinDetailData);
      }
    }

    if (cvtData.applied_criteria && cvtData.applied_criteria.length) {
      for (let appliedCriteriaItem of cvtData.applied_criteria) {
        const newCriteriaData = {
          ...new TradeinProgramCriteriaEntity(),
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
      return this.get(newTradeinProgram.tradein_id);
    }
  }

  async itgUpdate(data) {
    const currentTradeinProgram = await this.tradeinProgramRepo.findOne({
      tradein_appcore_id: data.id,
    });

    if (!currentTradeinProgram) {
      return this.itgCreate(data);
    }

    const cvtData: any = convertTradeinProgramFromAppcore(data);

    const tradeinProgramData = {
      ...this.tradeinProgramRepo.setData(cvtData),
      updated_at: formatStandardTimeStamp(),
    };

    const updatedTradeinProgram = await this.tradeinProgramRepo.update(
      { tradein_id: currentTradeinProgram.tradein_id },
      tradeinProgramData,
      true,
    );

    if (cvtData.applied_products && cvtData.applied_products.length) {
      await this.tradeinProgramDetailRepo.delete({
        tradein_id: updatedTradeinProgram.tradein_id,
      });
      for (let tradeinDetail of cvtData.applied_products) {
        let product = await this.productRepo.findOne({
          select: `*, ${Table.PRODUCTS}.product_id`,
          join: productLeftJoiner,
          where: {
            [`${Table.PRODUCTS}.product_appcore_id`]:
              tradeinDetail.product_appcore_id,
          },
        });

        if (!product) {
          const newProductData = {
            ...new ProductsEntity(),
            ...this.productRepo.setData(tradeinDetail),
            slug: convertToSlug(tradeinDetail.product),
          };
          product = await this.productRepo.create(newProductData);

          let productDescData = {
            ...new ProductDescriptionsEntity(),
            ...this.productDescRepo.setData(tradeinDetail),
            product_id: product.product_id,
          };
          await this.productDescRepo.create(productDescData, false);

          let newProductCategoryData = {
            ...new ProductsCategoriesEntity(),
            ...this.productCategoryRepo.setData(tradeinDetail),
            category_id: 1,
            product_id: product['product_id'],
          };
          await this.productCategoryRepo.create(newProductCategoryData, false);
        }

        let productPrice = await this.productRepo.findOne({
          product_id: product.product_id,
        });
        if (productPrice) {
          await this.productPriceRepo.update(
            { product_id: product.product_id },
            { collect_price: tradeinDetail.collect_price },
          );
        } else {
          await this.productPriceRepo.create({
            product_id: product.product_id,
            collect_price: tradeinDetail.collect_price,
          });
        }

        const tradeinDetailData = {
          ...new TradeinProgramDetailEntity(),
          ...this.tradeinProgramDetailRepo.setData(tradeinDetail),
          product_id: product.product_id,
          tradein_id: updatedTradeinProgram.tradein_id,
        };
        await this.tradeinProgramDetailRepo.create(tradeinDetailData, false);
      }
    }

    if (cvtData.applied_criteria && cvtData.applied_criteria.length) {
      await this.tradeinProgramCriteriaRepo.delete({
        tradein_id: updatedTradeinProgram.tradein_id,
      });
      for (let appliedCriteriaItem of cvtData.applied_criteria) {
        const newCriteriaData = {
          ...new TradeinProgramCriteriaEntity(),
          ...this.tradeinProgramCriteriaRepo.setData(appliedCriteriaItem),
          tradein_id: updatedTradeinProgram.tradein_id,
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
    return this.get(updatedTradeinProgram.tradein_id);
  }

  async itgCreateOldReceipt(data) {
    const cvtData = convertTradeinProgramOldReceiptFromAppcore(data);
    const checkExist = await this.tradeinOldReceiptRepo.findOne({
      old_receipt_appcore_id: cvtData['old_receipt_appcore_id'],
    });
    if (checkExist) {
      throw new HttpException('Phiếu thu cũ đã tồn tại.', 409);
    }
    const oldReceiptData = {
      ...new TradeinOldReceiptEntity(),
      ...this.tradeinOldReceiptRepo.setData(cvtData),
    };

    const user = await this.userRepo.findOne({
      user_appcore_id: cvtData['user_appcore_id'],
    });
    if (user) {
      oldReceiptData['user_id'] = user['user_id'];
    }

    const newOldReceipt = await this.tradeinOldReceiptRepo.create(
      oldReceiptData,
    );
    if (cvtData['detail_items'] && cvtData['detail_items'].length) {
      for (let detailItem of cvtData['detail_items']) {
        let product = await this.productRepo.findOne({
          product_appcore_id: detailItem['product_appcore_id'],
        });
        if (!product) {
          let newProductData = {
            ...new ProductsEntity(),
            ...this.productRepo.setData(detailItem),
          };
          product = await this.productRepo.create(newProductData);

          let newProductDescData = {
            ...new ProductDescriptionsEntity(),
            ...this.productDescRepo.setData(detailItem),
            product_id: product['product_id'],
          };
          await this.productDescRepo.create(newProductDescData, false);

          let newProductPriceData = {
            ...new ProductPricesEntity(),
            ...this.productPriceRepo.setData(detailItem),
            product_id: product['product_id'],
          };
          await this.productPriceRepo.create(newProductPriceData, false);

          let newProductCategoryData = {
            ...new ProductsCategoriesEntity(),
            ...this.productCategoryRepo.setData(detailItem),
            category_id: 1,
            product_id: product['product_id'],
          };
          await this.productCategoryRepo.create(newProductCategoryData, false);
        }
        const oldReceiptDetailData = {
          ...new TradeinOldReceiptDetailEntity(),
          ...this.tradeinOldReceiptDetailRepo.setData(detailItem),
          old_receipt_id: newOldReceipt.old_receipt_id,
          product_id: product['product_id'],
        };
        await this.tradeinOldReceiptDetailRepo.create(
          oldReceiptDetailData,
          false,
        );
      }
    }
    return this.getOldReceiptById(newOldReceipt['old_receipt_id']);
  }

  async itgUpdateOldReceipt(data) {
    const cvtData = convertTradeinProgramOldReceiptFromAppcore(data);
    const currentOldReipt = await this.tradeinOldReceiptRepo.findOne({
      old_receipt_appcore_id: cvtData['old_receipt_appcore_id'],
    });
    if (!currentOldReipt) {
      return this.itgCreateOldReceipt(data);
    }

    const oldReceiptData = this.tradeinOldReceiptRepo.setData(cvtData);
    if (cvtData['user_appcore_id']) {
      const user = await this.userRepo.findOne({
        user_appcore_id: cvtData['user_appcore_id'],
      });
      if (user) {
        oldReceiptData['user_id'] = user['user_id'];
      }
    }

    const updatedOldReceipt = await this.tradeinOldReceiptRepo.update(
      { old_receipt_id: currentOldReipt['old_receipt_id'] },
      oldReceiptData,
      false,
    );
    if (cvtData['detail_items'] && cvtData['detail_items'].length) {
      await this.tradeinOldReceiptDetailRepo.delete({
        old_receipt_id: currentOldReipt['old_receipt_id'],
      });
      for (let detailItem of cvtData['detail_items']) {
        let product = await this.productRepo.findOne({
          product_appcore_id: detailItem['product_appcore_id'],
        });
        if (!product) {
          let newProductData = {
            ...new ProductsEntity(),
            ...this.productRepo.setData(detailItem),
          };
          product = await this.productRepo.create(newProductData);

          let newProductDescData = {
            ...new ProductDescriptionsEntity(),
            ...this.productDescRepo.setData(detailItem),
            product_id: product['product_id'],
          };
          await this.productDescRepo.create(newProductDescData, false);

          let newProductPriceData = {
            ...new ProductPricesEntity(),
            ...this.productPriceRepo.setData(detailItem),
            product_id: product['product_id'],
          };
          await this.productPriceRepo.create(newProductPriceData, false);

          let newProductCategoryData = {
            ...new ProductsCategoriesEntity(),
            ...this.productCategoryRepo.setData(detailItem),
            category_id: 1,
            product_id: product['product_id'],
          };
          await this.productCategoryRepo.create(newProductCategoryData, false);
        }
        const oldReceiptDetailData = {
          ...new TradeinOldReceiptDetailEntity(),
          ...this.tradeinOldReceiptDetailRepo.setData(detailItem),
          old_receipt_id: currentOldReipt.old_receipt_id,
          product_id: product['product_id'],
        };
        await this.tradeinOldReceiptDetailRepo.create(
          oldReceiptDetailData,
          false,
        );
      }
    }
    return this.getOldReceiptById(currentOldReipt['old_receipt_id']);
  }

  async getOldReceiptById(old_receipt_id) {
    let oldReceipt = await this.tradeinOldReceiptRepo.findOne({
      old_receipt_id,
    });
    if (!oldReceipt) {
      throw new HttpException('Không tìm thấy phiếu thu cũ', 404);
    }

    oldReceipt['detail_items'] = [];
    let oldReceiptDetailItems = await this.tradeinOldReceiptDetailRepo.find({
      old_receipt_id,
    });
    if (oldReceiptDetailItems.length) {
      for (let oldReceiptDetailItem of oldReceiptDetailItems) {
        const _oldReceiptDetailItem =
          await this.tradeinOldReceiptDetailRepo.findOne({
            detail_id: oldReceiptDetailItem['detail_id'],
          });
        if (_oldReceiptDetailItem) {
          oldReceipt['detail_items'].push(_oldReceiptDetailItem);
        }
      }
    }
    return oldReceipt;
  }

  async getOldReceiptByUserId(user_id, params) {
    let { page, skip, limit } = getPageSkipLimit(params);
    const tradeinOldReceipts = await this.tradeinOldReceiptRepo.find({
      where: { user_id },
      skip,
      limit,
    });
    const count = await this.tradeinOldReceiptRepo.find({
      select: `COUNT(${Table.TRADEIN_OLD_RECEIPT}.old_receipt_id) as total`,
      where: { user_id },
    });

    if (tradeinOldReceipts.length) {
      for (let tradeinOldReceipt of tradeinOldReceipts) {
        const tradeinOldReceiptDetails =
          await this.tradeinOldReceiptDetailRepo.find({
            old_receipt_id: tradeinOldReceipt.old_receipt_id,
          });
        tradeinOldReceipt['detail_items'] = tradeinOldReceiptDetails;
      }
    }
    return {
      paging: { pageSize: limit, currentPage: page, total: count[0].total },
      data: tradeinOldReceipts,
    };
  }
}
