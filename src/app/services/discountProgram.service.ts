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
  ) {}

  async get(discount_id: number) {
    const discountProgram = await this.discountProgramRepo.findOne({
      discount_id,
    });
    if (!discountProgram) {
      throw new HttpException(
        'Không tìm thấy nhóm SP phụ kiện khuyến mãi',
        404,
      );
    }

    discountProgram['products'] = [];

    let productLists = await this.productRepo.find({
      select: '*',
      join: productDiscountProgramJoiner,
      where: {
        [`${Table.DISCOUNT_PROGRAM_DETAIL}.discount_id`]: discount_id,
      },
    });

    discountProgram['products'] = productLists;

    return discountProgram;
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
    return this.get(newProgramDiscount.discount_id);
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
    return this.get(discountProgram.discount_id);
  }
}
