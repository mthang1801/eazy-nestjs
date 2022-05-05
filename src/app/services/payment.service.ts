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
import {
  cartPaymentJoiner,
  userJoiner,
  productJoiner,
  productLeftJoiner,
} from '../../utils/joinTable';
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

import { OrderPaymentRepository } from '../repositories/orderPayment.repository';
import { OrderPaymentEntity } from '../entities/orderPayment.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import { Not, Equal } from '../../database/operators/operators';
import { CreatePayooInstallmentDto } from '../dto/orders/create-payooInstallment.dto';
import { CreateInstallmentDto } from '../dto/payment/create-installment.dto';
import { UPDATE_ORDER_PAYMENT } from '../../constants/api.appcore';
import { PaymentStatus } from '../../utils/services/payment.helper';
import { CreatePaymentSelfTransportDto } from '../dto/orders/create-paymentSelfTransport.dto';
import { ShippingFeeService } from './shippingFee.service';
import {
  calculateInstallmentInterestRateHDSaiGon,
  calculateInstallmentInterestRateHomeCredit,
} from '../../utils/services/payment.helper';

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
    private productRepo: ProductsRepository<ProductsEntity>,
    private shippingFeeService: ShippingFeeService,
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

  async paymentInstallment(data: CreateInstallmentDto) {
    try {
      let product = await this.productRepo.findOne({
        select: '*',
        join: productLeftJoiner,
        where: {
          [`${Table.PRODUCTS}.product_id`]: data.product_id,
          product_function: Not(Equal('1')),
          product_type: Not(Equal('4')),
        },
      });
      if (!product) {
        throw new HttpException(
          'Không tìm thấy sản phẩm hoặc sản phẩm không thể bán.',
          404,
        );
      }

      let user = await this.userRepo.findOne({
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

      let totalPrice = product['price'];
      let cartItems = [{ ...product, amount: 1 }];

      let responseData;

      let installed_money_account_id = 20574861;
      switch (+data.company_id) {
        case 1:
          installed_money_account_id = 20574861;
          responseData = calculateInstallmentInterestRateHDSaiGon(
            totalPrice,
            data.prepaid_percentage,
            data.tenor,
          );
          break; //HD Saigon
        case 2:
          installed_money_account_id = 20574874;
          responseData = calculateInstallmentInterestRateHomeCredit(
            totalPrice,
            data.prepaid_percentage,
            data.tenor,
          );

          break; // Home Credit
      }

      let paymentPerMonth = responseData.paymentPerMonth;
      let totalInterest = responseData.totalInterest;
      let interestPerMonth = responseData.interestPerMonth;
      let prepaidAmount = responseData.prepaidAmount;
      //20574874 Home credit
      //20630206 payoo
      console.log(272, totalPrice);
      let refOrderId = generateRandomString();
      let sendData = {
        ...user,
        s_phone: data.s_phone,
        s_lastname: data.s_lastname,
        s_city: data.s_city,
        s_district: data.s_district,
        s_ward: data.s_ward,
        s_address: data.s_address,
        order_items: cartItems,
        transfer_amount: totalPrice,
        pay_credit_type: 3,
        installed_tenor: data.tenor,
        installed_prepaid_amount: prepaidAmount,
        installment_interest_rate_code: totalInterest,
        installed_money_amount: paymentPerMonth,
        installed_money_account_id,
        ref_order_id: refOrderId,
        installmentCode: refOrderId,
        payment_status: PaymentStatus.success,
      };

      delete sendData['created_at'];
      delete sendData['updated_at'];

      const result = await this.orderService.createOrder(user, sendData);

      if (data['s_city']) {
        const shippingFee = await this.shippingFeeService.calcShippingFee(
          +data['s_city'],
        );
        if (shippingFee) {
          totalPrice = +totalPrice + +shippingFee.value_fee;
        }
      }

      const paymentAppcoreData = {
        installmentAccountId: installed_money_account_id,
        installmentCode: refOrderId,
        paymentStatus: 'success',
        totalAmount: +totalPrice,
      };

      const response = await axios({
        method: 'PUT',
        url: UPDATE_ORDER_PAYMENT(result.order_code),
        data: paymentAppcoreData,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async payooPaymentPaynow(data: CreatePaynowDto) {
    return this.payooPayment(data, 'paynow');
  }

  async payooPaymentSelftransport(data: CreatePaymentSelfTransportDto) {
    return this.payooPayment(data, 'selfTransport');
  }

  async payooPaymentInstallment(data: CreatePayooInstallmentDto, user) {
    return this.payooPayment(data, 'installment', user);
  }

  async payooPayment(data, method, userAuth = null) {
    try {
      let cartItems = [];
      if (method === 'installment') {
        let product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: { [`${Table.PRODUCTS}.product_id`]: data.product_id },
        });
        if (!product) {
          throw new HttpException('Không tìm thấy SP', 404);
        }
        cartItems = [
          { product_id: product.product_id, amount: 1, price: product.price },
        ];
      } else {
        const cart = await this.cartRepo.findOne({ user_id: data['user_id'] });
        if (!cart) {
          throw new HttpException('Không tìm thấy giỏ hàng', 404);
        }
        cartItems = await this.cartItemRepo.find({
          select: `*, ${Table.CART_ITEMS}.amount`,
          join: cartPaymentJoiner,
          where: { [`${Table.CART_ITEMS}.cart_id`]: cart.cart_id },
        });
      }

      let totalPrice = cartItems.reduce(
        (acc, ele) => acc + ele.price * ele.amount,
        0,
      );

      if (data.coupon_code) {
        let checkCouponData = {
          store_id: method === 'selfTransport' ? data['store_id'] : 67107,
          coupon_code: data['coupon_code'],
          coupon_programing_id: 'HELLO_123',
          phone: method === 'selfTransport' ? data['b_phone'] : data['s_phone'],
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

      let user;
      if (userAuth) {
        user = await this.userRepo.findOne({
          select: `*, ${Table.USERS}.user_appcore_id`,
          join: userJoiner,
          where: { [`${Table.USERS}.user_id`]: userAuth.user_id },
        });
      } else {
        user = await this.userRepo.findOne({
          select: `*, ${Table.USERS}.user_appcore_id`,
          join: userJoiner,
          where: { [`${Table.USERS}.user_id`]: data.user_id },
        });

        if (!user) {
          user = await this.userRepo.findOne({
            select: `*, ${Table.USERS}.user_appcore_id`,
            join: userJoiner,
            where: {
              [`${Table.USERS}.phone`]:
                method === 'selfTransport' ? data['b_phone'] : data['s_phone'],
            },
          });
          if (!user) {
            await this.customerService.createCustomerFromWebPayment(data);
            user = await this.userRepo.findOne({
              select: `*, ${Table.USERS}.user_appcore_id`,
              join: userJoiner,
              where: {
                phone:
                  method === 'selfTransport'
                    ? data['b_phone']
                    : data['s_phone'],
              },
            });
          }
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

      if (method === 'selfTransport') {
        sendData['store_id'] = data.store_id;
      }

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
        case 'selfTransport':
          dataRequest = this.payooPaymentSelfTransportData(
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

  payooPaymentSelfTransportData(
    userWebInfo,
    ref_order_id,
    paymentDate,
    orderTotalPrice,
  ) {
    const { b_lastname, b_phone, callback_url } = userWebInfo;
    let bodyData = `<shops><shop><username>${payooBusinessName}</username><shop_id>${payooShopId}</shop_id><session>${ref_order_id}</session><shop_title>${payooShopTitle}</shop_title><shop_domain>${webDomain}</shop_domain><shop_back_url>${payooRefer}/${callback_url}</shop_back_url><order_no>${ref_order_id}</order_no><order_cash_amount>${orderTotalPrice}</order_cash_amount><order_ship_date>${paymentDate}</order_ship_date><order_ship_days>7</order_ship_days><order_description>UrlEncode(Mô tả chi tiết của đơn hàng(Chi tiết về sản phẩm/dịch vụ/chuyến bay.... Chiều dài phải hơn 50 ký tự. Nội dung có thể dạng văn bản hoặc mã HTML)</order_description><notify_url>${payooPaymentNotifyURL}</notify_url><validity_time>${validTime}</validity_time><payment_group>bank-account,cc,payoo-account</payment_group><customer><name>${b_lastname}</name><phone>${b_phone}</phone><address>...</address></customer></shop></shops>`;
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
    console.log(data);
    let startIndex = notifyData.indexOf('<Data>') + '<Data>'.length;
    let endIndex = notifyData.indexOf('</Data>');
    let _notifyData = notifyData.substring(startIndex, endIndex);

    let decodedData = Buffer.from(_notifyData, 'base64').toString('utf8');

    const orderNoIndexStart =
      decodedData.indexOf('<order_no>') + '<order_no>'.length;
    const orderNoIndexEnd = decodedData.indexOf('</order_no>');
    const orderNo = decodedData.substring(orderNoIndexStart, orderNoIndexEnd);

    let startAmountIndex =
      decodedData.indexOf('<order_cash_amount>') + '<order_cash_amount>'.length;
    let endAmountIndex = decodedData.indexOf('</order_cash_amount>');
    let amount = decodedData.substring(startAmountIndex, endAmountIndex);

    try {
      const order = await this.orderRepo.findOne({ ref_order_id: orderNo });

      const updateOrderData = {
        payment_status: PaymentStatus.success,
        status: OrderStatus.purchased,
      };
      await this.orderRepo.update(
        { order_id: order.order_id },
        updateOrderData,
      );
      let orderPayment = await this.orderPaymentRepo.findOne({
        order_id: order.order_id,
      });

      if (!orderPayment) {
        const newOrderPaymentData = {
          ...new OrderPaymentEntity(),
          order_no: orderNo,
          amount,
          order_id: order.order_id,
        };
        orderPayment = await this.orderPaymentRepo.create(newOrderPaymentData);
      }

      await this.orderService.updateAppcoreOrderPayment(order.order_id);
    } catch (error) {
      throw new HttpException('VERIFY_SIGNATURE_FAIL', 400);
    }
  }

  async getProductInstallment(params) {
    let { product_id, prepaid_percentage, company_id } = params;

    if (!product_id || !prepaid_percentage) {
      throw new HttpException(
        'Cần truyền id sản phẩm, kỳ hạn thanh toán và lãi suất',
        400,
      );
    }
    let product = await this.productRepo.findOne({
      select: '*',
      join: productLeftJoiner,
      where: {
        [`${Table.PRODUCTS}.product_id`]: product_id,
      },
    });

    let totalPrice = product.price;
    let results = [];

    switch (+company_id) {
      case 1: {
        // HD Saigon
        let tenors = [6, 9, 12];
        for (let tenor of tenors) {
          let result = calculateInstallmentInterestRateHDSaiGon(
            totalPrice,
            prepaid_percentage,
            tenor,
          );
          results.push(result);
        }
        return results;
      }
      case 2: {
        // HOME Credit
        let tenors = [6, 9, 12];
        for (let tenor of tenors) {
          let result = calculateInstallmentInterestRateHomeCredit(
            totalPrice,
            prepaid_percentage,
            tenor,
          );
          results.push(result);
        }
        return results;
      }
    }
  }
}
