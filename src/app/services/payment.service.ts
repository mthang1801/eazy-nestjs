import { Injectable, HttpException } from '@nestjs/common';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentRepository } from '../repositories/payment.repository';
import { Table, JoinTable } from '../../database/enums/index';
import { PaymentDescriptionsRepository } from '../repositories/paymentDescription.repository';
import { PaymentDescriptionsEntity } from '../entities/paymentDescription.entity';

import { IPayment } from '../interfaces/payment.interface';
import { Like } from 'src/database/operators/operators';
import { paymentFilter } from 'src/utils/tableConditioner';
import axios from 'axios';
import { CreatePaynowDto } from '../dto/orders/create-paynow.dto';
import { CartRepository } from '../repositories/cart.repository';
import { CartEntity } from '../entities/cart.entity';
import { CartItemRepository } from '../repositories/cartItem.repository';
import { CartItemEntity } from '../entities/cartItem.entity';
import { cartPaymentJoiner, userJoiner } from '../../utils/joinTable';
import { PromotionService } from './promotion.service';
import {
  generateRandomString,
  formatStandardTimeStamp,
} from '../../utils/helper';
import { generateSHA512 } from '../../utils/cipherHelper';
import {
  payooChecksum,
  payooRefer,
  payooPaymentURL,
  payooBusinessName,
  payooAPIPassword,
  payooAPISignature,
  payooAPIUserName,
  payooShopId,
  payooShopTitle,
  webDomain,
} from '../../constants/payment';
import { UserRepository } from '../repositories/user.repository';

import { UserEntity } from '../entities/user.entity';
import { CustomerService } from './customer.service';
import { PayCreditFeeType } from '../../database/enums/tableFieldEnum/order.enum';
import { OrdersService } from './orders.service';
import * as moment from 'moment';

@Injectable()
export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository<PaymentEntity>,
    private paymentDescriptionRepo: PaymentDescriptionsRepository<PaymentDescriptionsEntity>,
    private cartRepo: CartRepository<CartEntity>,
    private cartItemRepo: CartItemRepository<CartItemEntity>,
    private promotionService: PromotionService,
    private userRepo: UserRepository<UserEntity>,
    private customerService: CustomerService,
    private orderService: OrdersService,
  ) {}

  async getList(params) {
    //=====Filter param
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let filterCondition = {};

    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.paymentRepository.tableProps.includes(key)) {
          filterCondition[`${Table.PAYMENT}.${key}`] = Like(val);
          continue;
        }
        if (this.paymentDescriptionRepo.tableProps.includes(key)) {
          filterCondition[`${Table.PAYMENT_DESCRIPTION}.${key}`] = Like(val);
        }
      }
    }

    const payments = await this.paymentRepository.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_payment_descriptions: {
            fieldJoin: 'payment_id',
            rootJoin: 'payment_id',
          },
        },
      },
      where: paymentFilter('', filterCondition),
      skip: skip,
      limit: limit,
    });

    const count = await this.paymentRepository.find({
      select: `COUNT(DISTINCT(${Table.PAYMENT}.payment_id)) as total`,
      join: {
        [JoinTable.join]: {
          ddv_payment_descriptions: {
            fieldJoin: 'payment_id',
            rootJoin: 'payment_id',
          },
        },
      },
      where: paymentFilter('', filterCondition),
    });

    return {
      payments,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : payments.length,
      },
    };
  }

  async payooPayment(data) {
    let requestData = `{\"OrderNo\":\"273ASOA3621897\",\"ShopID\":\"590\",\"FromShipDate\":\"14/08/2017\",\"ShipNumDay\":\"1\",\"Description\":\"Đơn hàng: PR_ORD_20170814171400 Thanh toán cho dịch vụ/ chương trình/ chuyến đi..... Sốtiền thanh toán: 50000\",\"CyberCash\":\"50000\",\"PaymentExpireDate\":\"20220814201400\",\"NotifyUrl\":\"http://localhost:5000\",\"InfoEx\":\"%3cInfoEx%3e%3cCustomerPhone%3e09022333556%3c%2fCustomerPhone%3e%3cCustomerEmail%3email%40gmail.com%3c%2fCustomerEmail%3e%3cTitle%3eTest+title%3c%2fTitle%3e%3c%2fInfoEx%3e\"}`;
    let signNature = '9ea7434ff04572a64c61cd602f6de2e3';
    let response = await axios({});
  }

  async getById(id): Promise<IPayment[]> {
    const string = `${Table.PAYMENT}.payment_id`;

    const payments = await this.paymentRepository.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_payment_descriptions: {
            fieldJoin: 'payment_id',
            rootJoin: 'payment_id',
          },
        },
      },
      where: { [string]: id },
      skip: 0,
      limit: 30,
    });
    return payments;
  }

  async create(data): Promise<IPayment> {
    const PaymentData = {
      ...this.paymentRepository.setData(data),
    };

    let _payment = await this.paymentRepository.create(PaymentData);

    ///===========================================
    const PaymentDesData = {
      payment_id: _payment.payment_id,
      ...this.paymentDescriptionRepo.setData(data),
    };

    let _paymentDes = await this.paymentDescriptionRepo.create(PaymentDesData);
    return { ..._payment, ..._paymentDes };
  }

  async update(id, data): Promise<IPayment> {
    const PaymentData = {
      ...this.paymentRepository.setData(data),
    };

    let _payment = await this.paymentRepository.update(id, PaymentData);

    ///===========================================
    const PaymentDesData = {
      payment_id: _payment.payment_id,
      ...this.paymentDescriptionRepo.setData(data),
    };

    let _paymentDes = await this.paymentDescriptionRepo.update(
      id,
      PaymentDesData,
    );
    return { ..._payment, ..._paymentDes };
  }

  async paymentPaynow(data: CreatePaynowDto) {
    try {
      // this.dbService.startTransaction();
      const cart = await this.cartRepo.findOne({ user_id: data['user_id'] });
      if (!cart) {
        throw new HttpException('Không tìm thấy giỏ hàng', 404);
      }
      let cartItems = await this.cartItemRepo.find({
        select: '*',
        join: cartPaymentJoiner,
        where: { [`${Table.CART_ITEMS}.cart_id`]: cart.cart_id },
      });

      let totalPrice = cartItems.reduce(
        (acc, ele) => acc + ele.price * ele.amount,
        0,
      );

      if (data.coupon_code) {
        let checkCouponData = {
          store_id: 67107,
          coupon_code: data['coupon_code'],
          coupon_programing_id: 'HELLO_123',
          phone: data['s_phone'],
          products: cartItems.map(({ product_id, amount }) => ({
            product_id,
            amount,
          })),
        };

        let checkResult = await this.promotionService.checkCoupon(
          checkCouponData,
        );

        if (checkResult['isValid']) {
          totalPrice -= checkResult['discountMoney'];
        }
      }

      const headers = {
        APIUsername: payooAPIUserName,
        APIPassword: payooAPIPassword,
        APISignature: payooAPISignature,
        'Content-Type': 'application/json',
      };
      let ref_order_id = generateRandomString();

      const dataRequest = this.payooPaymentData(data, ref_order_id, totalPrice);
      console.log(totalPrice);
      const checksum = generateSHA512(payooChecksum + dataRequest);
      const refer = payooRefer;
      const method = data['method'] || 'CC';
      const bank = data['bank'] || 'VISA';

      const body = {
        data: dataRequest,
        refer,
        method,
        bank,
        checksum,
      };

      const response = await axios({
        url: payooPaymentURL,
        method: 'POST',
        headers,
        data: body,
      });

      if (!response?.data) {
        throw new HttpException('Tạo thanh toán không thành công', 400);
      }

      if (
        response?.data?.ordercode &&
        ![200, 201].includes(+response.data.ordercode)
      ) {
        throw new HttpException(
          `Tạo thanh toán không thành công : ${response.data.message}`,
          response.data.errorcode,
        );
      }

      let user = await this.userRepo.findOne({
        select: `*, ${Table.USERS}.user_appcore_id`,
        join: userJoiner,
        where: { [`${Table.USERS}.user_id`]: data.user_id },
      });
      if (!user) {
        user = await this.userRepo.findOne({
          select: `*, ${Table.USERS}.user_appcore_id`,
          join: userJoiner,
          where: { [`${Table.USERS}.phone`]: data['s_phone'] },
        });
        if (!user) {
          await this.customerService.createCustomerFromWebPayment(data);
          user = await this.userRepo.findOne({
            select: `*, ${Table.USERS}.user_appcore_id`,
            join: userJoiner,
            where: { phone: data['s_phone'] },
          });
        }
      }

      let orderPaymentData = {
        ...response.data.order,
        order_gateway_id: response.data.order?.order_id || null,
        checksum: response.data.checksum,
        expiry_date: response.data.order?.expire_date
          ? formatStandardTimeStamp(response.data.order.expire_date)
          : null,
      };
      const sendData = {
        ...user,
        order_items: cartItems,
        pay_credit_type: PayCreditFeeType.Chuyen_khoan,
        ref_order_id,
        transfer_amount: totalPrice,
        coupon_code: data.coupon_code ? data.coupon_code : null,
        order_code: null,

        orderPayment: orderPaymentData,
      };
      console.log(sendData);
      await this.orderService.createOrder(user, sendData, false);

      return response.data;
      // await this.cartRepo.delete({ cart_id: cart.cart_id });
      // await this.cartItemRepo.delete({ cart_id: cart.cart_id });
      // await this.dbService.commitTransaction();
    } catch (error) {
      // await this.dbService.rollbackTransaction();

      throw new HttpException(
        error.message || error?.response?.data?.message,
        error.status || error?.response?.status,
      );
    }
  }

  payooPaymentData(userWebInfo, ref_order_id, orderTotalPrice) {
    const { s_lastname, s_phone, s_address, callback_url } = userWebInfo;
    let bodyData = `<shops><shop><username>${payooBusinessName}</username><shop_id>${payooShopId}</shop_id><session>${ref_order_id}</session><shop_title>${payooShopTitle}</shop_title><shop_domain>${webDomain}</shop_domain><shop_back_url>${payooRefer}/${
      userWebInfo.callback_url
    }</shop_back_url><order_no>${ref_order_id}</order_no><order_cash_amount>${orderTotalPrice}</order_cash_amount><order_ship_date>${moment(
      new Date(),
    ).format(
      'DD/MM/YYYY',
    )}</order_ship_date><order_ship_days>7</order_ship_days><order_description>UrlEncode(Mô tả chi tiết của đơn hàng(Chi tiết về sản phẩm/dịch vụ/chuyến bay.... Chiều dài phải hơn 50 ký tự. Nội dung có thể dạng văn bản hoặc mã HTML)</order_description><notify_url>https://ddvwsdev.ntlogistics.vn/web-tester/v1/products/test</notify_url><validity_time>20220808081203</validity_time><customer><name>${s_lastname}</name><phone>${s_phone}</phone><address>${s_address}</address></customer></shop></shops>`;
    return bodyData;
  }

  async payooNotify(data) {
    console.log(data);
  }
}
