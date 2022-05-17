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
import { convertToSlug, formatStandardTimeStamp } from '../../utils/helper';
import { get } from 'lodash';
import { getProductAccessorySelector } from '../../utils/tableSelector';
import { productPromotionAccessoryJoiner, productDiscountProgramJoiner } from '../../utils/joinTable';
@Injectable()
export class DiscountProgramService {
    constructor(
        private discountProgramRepo: DiscountProgramRepository<DiscountProgramEntity>,
        private discountProgramDetailRepo: DiscountProgramDetailRepository<DiscountProgramDetailEntity>,
        private productRepo: ProductsRepository<ProductsEntity>,
        private productPriceRepo: ProductPricesRepository<ProductPricesEntity>,
        private productDescRepo: ProductDescriptionsRepository<ProductDescriptionsEntity>,
    ) {}

    async get(accessory_id: number) {
        const discountProgram = await this.discountProgramRepo.findOne({
          accessory_id,
        });
        if (!discountProgram) {
          throw new HttpException(
            'Không tìm thấy nhóm SP phụ kiện khuyến mãi',
            404,
          );
        }
    
        discountProgram['display_at'] = formatStandardTimeStamp(
          discountProgram['display_at'],
        );
        discountProgram['end_at'] = formatStandardTimeStamp(
          discountProgram['end_at'],
        );
        discountProgram['created_at'] = formatStandardTimeStamp(
          discountProgram['created_at'],
        );
        discountProgram['updated_at'] = formatStandardTimeStamp(
          discountProgram['updated_at'],
        );
    
        discountProgram['products'] = [];
    
        let productLists = await this.productRepo.find({
          select: getProductAccessorySelector,
          join: productDiscountProgramJoiner,
          where: {
            [`${Table.DISCOUNT_PROGRAM_DETAIL}.accessory_id`]:
              accessory_id,
          },
        });
    
        discountProgram['products'] = productLists;
    
        return discountProgram;
      }

    async itgCreateDiscountPrograms(data) {
        const cvtData = convertDiscountProgramFromAppcore(data);
        const discountProgram = await this.discountProgramRepo.findOne({
          app_core_id: cvtData.app_core_id,
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
            let product = await this.productRepo.findOne({
              product_appcore_id: programDetail['product_appcore_id'],
            });
            const updatedProductPriceData = {
              price: programDetail['sale_price'],
              promotion_price: programDetail['promotion_price'],
              promotion_discount_amount: programDetail['discount_amount'],
              promotion_discount_type: programDetail['discount_type'],
              promotion_start_at: cvtData['time_start_at'],
              promotion_end_at: cvtData['time_end_at'],
            };
            if (!product) {
              const productData = {
                ...new ProductsEntity(),
                ...this.productRepo.setData(programDetail),
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
              await this.productPriceRepo.update(
                { product_id: product.product_id },
                { ...updatedProductPriceData },
              );
            }
    
            const newProgramDetail = {
              ...new DiscountProgramDetailEntity(),
              ...this.discountProgramDetailRepo.setData(programDetail),
              accessory_id: newProgramDiscount.accessory_id,
              product_id: product.product_id,
            };
            await this.discountProgramDetailRepo.create(newProgramDetail);
          }
        }
        return this.get(newProgramDiscount.accessory_id);
      }
    
    async itgUpdateDiscountPrograms(data) {
        const cvtData = convertDiscountProgramFromAppcore(data);
        const discountProgram = await this.discountProgramRepo.findOne({
          app_core_id: cvtData.app_core_id,
        });
    
        if (!discountProgram) {
          return this.itgCreateDiscountPrograms(data);
        }
    
        const programDiscountData = {
          ...this.discountProgramRepo.setData(cvtData),
          updated_at: formatStandardTimeStamp(),
        };
        await this.discountProgramRepo.update(
          { accessory_id: discountProgram.accessory_id },
          programDiscountData,
        );
    
        if (cvtData['details'] && cvtData['details'].length) {
          let oldProgramDetails = await this.discountProgramDetailRepo.find({
            accessory_id: discountProgram.accessory_id,
          });
          if (oldProgramDetails.length) {
            for (let oldProgramDetail of oldProgramDetails) {
              if (oldProgramDetail.product_id) {
                await this.productPriceRepo.update(
                  { product_id: oldProgramDetail.product_id },
                  {
                    promotion_price: 0,
                    promotion_start_at: null,
                    promotion_end_at: null,
                    promotion_discount_amount: 0,
                  },
                );
              }
              await this.discountProgramDetailRepo.delete({
                accessory_id: discountProgram.accessory_id,
              });
            }
          }
    
          for (let programDetail of cvtData['details']) {
            let product = await this.productRepo.findOne({
              product_appcore_id: programDetail['product_appcore_id'],
            });
            const updatedProductPriceData = {
              price: programDetail['sale_price'],
              promotion_price: programDetail['promotion_price'],
              promotion_discount_amount: programDetail['discount_amount'],
              promotion_discount_type: programDetail['discount_type'],
              promotion_start_at: cvtData['time_start_at'],
              promotion_end_at: cvtData['time_end_at'],
            };
            if (!product) {
              const productData = {
                ...new ProductsEntity(),
                ...this.productRepo.setData(programDetail),
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
              await this.productPriceRepo.update(
                { product_id: product.product_id },
                { ...updatedProductPriceData },
              );
            }
    
            const newProgramDetailData = {
              ...new DiscountProgramDetailEntity(),
              ...this.discountProgramDetailRepo.setData(programDetail),
              accessory_id: discountProgram.accessory_id,
              product_id: product.product_id,
            };
            await this.discountProgramDetailRepo.create(newProgramDetailData);
          }
        }
        return this.get(discountProgram.accessory_id);
    }
}