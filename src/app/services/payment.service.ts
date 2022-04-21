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
  payooBusinessName,
  payooAPIPassword,
  payooAPISignature,
  payooAPIUserName,
  payooShopId,
  payooShopTitle,
  webDomain,
  payooPaymentNotifyURL,
  PaymentStatus,
  validTime,
} from '../../constants/payment';
import { UserRepository } from '../repositories/user.repository';

import { UserEntity } from '../entities/user.entity';
import { CustomerService } from './customer.service';
import { PayCreditFeeType } from '../../database/enums/tableFieldEnum/order.enum';
import { OrdersService } from './orders.service';
import * as moment from 'moment';
import { Data } from 'ejs';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderEntity } from '../entities/orders.entity';
import {
  shippingDate,
  payooPaynowURL,
  payooInstallmentURL,
} from '../../constants/payment';
import { OrderStatus } from '../../constants/order';
import { DatabaseService } from '../../database/database.service';
import { CreateInstallmentDto } from '../dto/orders/create-installment.dto';
import { calculateInstallmentInterestRate } from '../../constants/payment';
import { OrderPaymentRepository } from '../repositories/orderPayment.repository';
import { OrderPaymentEntity } from '../entities/orderPayment.entity';

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
    private orderRepo: OrdersRepository<OrderEntity>,
    private orderPaymentRepo: OrderPaymentRepository<OrderPaymentEntity>,
    private dbService: DatabaseService,
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

  async paymentInstallment(data) {
    try {
      const cart = await this.cartRepo.findOne({ user_id: data['user_id'] });
      if (!cart) {
        throw new HttpException('Không tìm thấy giỏ hàng', 404);
      }
      let cartItems = await this.cartItemRepo.find({
        select: `*, ${Table.CART_ITEMS}.amount`,
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

      const { paymentPerMonth, totalInterest, interestPerMonth, repaidAmount } =
        calculateInstallmentInterestRate(
          totalPrice,
          data.repaidPercentage,
          data.tenor,
        );

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
      let sendData = {
        ...user,
        order_items: cartItems,
        ref_order_id: generateRandomString(),
        transfer_amount: totalPrice,
        coupon_code: data.coupon_code ? data.coupon_code : null,
        order_code: null,
        status: OrderStatus.unfulfilled,
        repaid: repaidAmount,
        installed_money_amount: paymentPerMonth,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async payooPaymentPaynow(data: CreatePaynowDto) {
    return this.payooPayment(data, 'paynow');
  }

  async payooPaymentInstallment(data: CreateInstallmentDto) {
    return this.payooPayment(data, 'installment');
  }

  async payooPayment(data, method) {
    try {
      const cart = await this.cartRepo.findOne({ user_id: data['user_id'] });
      if (!cart) {
        throw new HttpException('Không tìm thấy giỏ hàng', 404);
      }
      let cartItems = await this.cartItemRepo.find({
        select: `*, ${Table.CART_ITEMS}.amount`,
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
          // totalPrice -= checkResult['discountMoney'];
        }
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
      let ref_order_id = generateRandomString();

      let sendData = {
        ...user,
        order_items: cartItems,
        ref_order_id,
        transfer_amount: totalPrice,
        coupon_code: data.coupon_code ? data.coupon_code : null,
      };

      await this.orderService.createOrder(user, sendData);

      const headers = {
        APIUsername: payooAPIUserName,
        APIPassword: payooAPIPassword,
        APISignature: payooAPISignature,
        'Content-Type': 'application/json',
      };

      const paymentDate = moment(new Date(Date.now() + shippingDate)).format(
        'DD/MM/YYYY',
      );
      const paymentDateTime = formatStandardTimeStamp(
        new Date(Date.now() + shippingDate),
      );

      let dataRequest;
      let urlRequest;
      switch (method) {
        case 'paynow':
          dataRequest = this.payooPaymentData(
            data,
            ref_order_id,
            paymentDate,
            totalPrice,
          );
          urlRequest = payooPaynowURL;
          break;
        case 'installment':
          dataRequest = this.payooInstallmentData(
            data,
            ref_order_id,
            paymentDate,
            totalPrice,
          );
          urlRequest = payooPaynowURL;
          break;
      }

      const checksum = generateSHA512(payooChecksum + dataRequest);
      const refer = payooRefer;
      const bank = data['bank'];

      const body = {
        data: dataRequest,
        refer,
        method: data.method,
        checksum,
      };

      if (bank) {
        body['bank'] = bank;
      }

      const response = await axios({
        url: urlRequest,
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

      const orderDataResponse = response.data.order;
      const currentOrder = await this.orderRepo.findOne({ ref_order_id });
      let orderPaymentData = {
        ...orderDataResponse,
        order_gateway_id: orderDataResponse?.order_id || null,
        checksum: response.data.checksum,
        expiry_date: orderDataResponse?.expire_date
          ? formatStandardTimeStamp(response.data.order.expiry_date)
          : null,
      };

      await this.orderService.updateOrderPayment(
        currentOrder.order_id,
        orderPaymentData,
      );

      // await this.cartRepo.delete({ cart_id: cart.cart_id });
      // await this.cartItemRepo.delete({ cart_id: cart.cart_id });

      return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message || error?.response?.data?.message,
        error.status || error?.response?.status,
      );
    }
  }

  payooPaymentData(userWebInfo, ref_order_id, paymentDate, orderTotalPrice) {
    const { s_lastname, s_phone, s_address, callback_url } = userWebInfo;
    let bodyData = `<shops><shop><username>${payooBusinessName}</username><shop_id>${payooShopId}</shop_id><session>${ref_order_id}</session><shop_title>${payooShopTitle}</shop_title><shop_domain>${webDomain}</shop_domain><shop_back_url>${payooRefer}/${callback_url}</shop_back_url><order_no>${ref_order_id}</order_no><order_cash_amount>${orderTotalPrice}</order_cash_amount><order_ship_date>${paymentDate}</order_ship_date><order_ship_days>7</order_ship_days><order_description>UrlEncode(Mô tả chi tiết của đơn hàng(Chi tiết về sản phẩm/dịch vụ/chuyến bay.... Chiều dài phải hơn 50 ký tự. Nội dung có thể dạng văn bản hoặc mã HTML)</order_description><notify_url>${payooPaymentNotifyURL}</notify_url><validity_time>${validTime}</validity_time><payment_group>bank-account,cc,payoo-account</payment_group><customer><name>${s_lastname}</name><phone>${s_phone}</phone><address>${s_address}</address></customer></shop></shops>`;
    return bodyData;
  }

  payooInstallmentData(
    userWebInfo,
    ref_order_id,
    paymentDate,
    orderTotalPrice,
  ) {
    const { s_lastname, s_phone, s_address, callback_url } = userWebInfo;
    let bodyData = `<shops><shop><username>${payooBusinessName}</username><shop_id>${payooShopId}</shop_id><session>${ref_order_id}</session><shop_title>${payooShopTitle}</shop_title><shop_domain>${webDomain}</shop_domain><shop_back_url>${payooRefer}/${callback_url}</shop_back_url><order_no>${ref_order_id}</order_no><order_cash_amount>${orderTotalPrice}</order_cash_amount><order_ship_date>${paymentDate}</order_ship_date><order_ship_days>7</order_ship_days><order_description>UrlEncode(Mô tả chi tiết của đơn hàng(Chi tiết về sản phẩm/dịch vụ/chuyến bay.... Chiều dài phải hơn 50 ký tự. Nội dung có thể dạng văn bản hoặc mã HTML)</order_description><notify_url>${payooPaymentNotifyURL}</notify_url><validity_time>${validTime}</validity_time><installment><tenors>3,6,9,12</tenors></installment><customer><name>${s_lastname}</name><phone>${s_phone}</phone><address>${s_address}</address></customer></shop></shops>`;
    return bodyData;
  }

  async payooNotify(data) {
    if (!data.NotifyData) {
      throw new HttpException('VERIFY_SIGNATURE_FAIL', 400);
    }
    let notifyData = data.NotifyData;
    console.log(decodedData);
    let startIndex = notifyData.indexOf('<Data>') + '<Data>'.length;
    let endIndex = notifyData.indexOf('</Data>');
    let _notifyData = notifyData.substring(startIndex, endIndex);

    let decodedData = Buffer.from(_notifyData, 'base64').toString('utf8');
    console.log(decodedData);
    const orderNoIndexStart =
      decodedData.indexOf('<order_no>') + '<order_no>'.length;
    const orderNoIndexEnd = decodedData.indexOf('</order_no>');
    const orderNo = decodedData.substring(orderNoIndexStart, orderNoIndexEnd);

    try {
      const order = await this.orderRepo.findOne({ ref_order_id: orderNo });

      const updateOrderData = {
        payment_status: PaymentStatus.paid,
        status: OrderStatus.purchased,
      };
      await this.orderRepo.update(
        { order_id: order.order_id },
        updateOrderData,
      );
      const orderPayment = await this.orderPaymentRepo.findOne({ order_id });
      const newOrderPaymentData = { ...new OrderPaymentEntity() };
      await this.orderService.updateAppcoreOrderPayment(order.order_id);
    } catch (error) {
      throw new HttpException('VERIFY_SIGNATURE_FAIL', 400);
    }
  }
}
