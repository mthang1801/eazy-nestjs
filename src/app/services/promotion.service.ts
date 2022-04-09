import { Injectable, HttpException } from '@nestjs/common';
import { CheckCouponDto } from '../dto/promotion/checkCoupon.dto';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import axios from 'axios';
import { CHECK_COUPON_API } from 'src/constants/api.appcore';
@Injectable()
export class PromotionService {
  constructor(private productRepo: ProductsRepository<ProductsEntity>) {}

  async checkCoupon(data: CheckCouponDto) {
    let coreData = {};
    coreData['couponCode'] = data.coupon_code;
    coreData['storeId'] = data.store_id || 67107;
    coreData['couponeProgramId'] = data.coupon_programing_id || '123';
    if (data.phone) {
      // Chưa thực thi
    }

    coreData['products'] = [];
    for (let productItem of data.products) {
      let product = await this.productRepo.findOne({
        product_id: productItem.product_id,
      });
      if (!product || !product['product_appcore_id']) {
        throw new HttpException(
          `Sản phẩm có id ${productItem.product_id} không tồn tại`,
          404,
        );
      }
      coreData['products'] = [
        ...coreData['products'],
        {
          productId: product['product_appcore_id'],
          quantity: productItem.amount,
        },
      ];
    }

    try {
      const responseCheck = await axios({
        url: CHECK_COUPON_API,
        method: 'POST',
        data: coreData,
      });
      if (!responseCheck?.data?.data) {
        throw new HttpException('Mã coupon không hợp lệ', 400);
      }
      return responseCheck?.data?.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error?.response?.data?.message || error.response,
        error?.response?.status || error.status,
      );
    }
  }
}
