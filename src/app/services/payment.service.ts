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
import { CreatePayooPaynowDto } from '../dto/orders/create-payooPaynow.dto';
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
import { generateSHA512, saltHashPassword } from '../../utils/cipherHelper';
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
} from '../../constants/payooPayment';
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
} from '../../constants/payooPayment';
import { OrderStatus, OrderType } from '../../constants/order';
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
import { ShippingFeeLocationRepository } from '../repositories/shippingFeeLocation.repository';
import {
  calculateInstallmentInterestRateHDSaiGon,
  calculateInstallmentInterestRateHomeCredit,
} from '../../utils/services/payment.helper';
import { ShippingFeeLocationEntity } from '../entities/shippingFeeLocation.entity';
import {
  shippingFeeLocationsJoiner,
  userPaymentJoiner,
} from '../../utils/joinTable';
import { userSelector } from '../../utils/tableSelector';
import { CreateMomoPaymentDto } from '../dto/orders/create-momoPayment.dto';
import { Cryptography } from '../../utils/cryptography';
import * as crypto from 'crypto';
import { MOMO_PARTNER_NAME, MOMO_PAYMENT } from '../../constants/momoPayment';

import {
  MOMO_SECRET_KEY,
  MOMO_API_ENPOINT,
  MOMO_PARTNER_CODE,
} from '../../constants/momoPayment';
import {
  MOMO_ACCESS_KEY,
  momoOrderInfo,
  momoRedirectUrl,
  momoIpnUrl,
  momoExtraData,
  momoRequestType,
  momoRequestId,
} from '../../constants/momoPayment';
import { request } from 'https';
import { constants } from 'fs';
import { GatewayName, GatewayAppcoreId } from '../../constants/paymentGateway';
import { CreateMomoPaymentSelfTransportDto } from '../dto/orders/create-momoSelfTransport.dto';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { defaultPassword } from '../../constants/defaultPassword';
import { UserTypeEnum } from '../../database/enums/tableFieldEnum/user.enum';
import { UserLoyaltyRepository } from '../repositories/userLoyalty.repository';
import { UserLoyaltyEntity } from '../entities/userLoyalty.entity';
import { UserDataRepository } from '../repositories/userData.repository';
import { UserDataEntity } from '../entities/userData.entity';

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
    private shippingFeeLocationRepo: ShippingFeeLocationRepository<ShippingFeeLocationEntity>,
    private userProfileRepo: UserProfileRepository<UserProfileEntity>,
    private userLoyaltyRepo: UserLoyaltyRepository<UserLoyaltyEntity>,
    private userDataRepo: UserDataRepository<UserDataEntity>,
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

    let _payment = await this.paymentRepository.update(id, PaymentData, true);

    ///===========================================
    const PaymentDesData = {
      payment_id: _payment.payment_id,
      ...this.paymentDescriptionRepo.setData(data),
    };

    let _paymentDes = await this.paymentDescriptionRepo.update(
      id,
      PaymentDesData,
      true,
    );
    return { ..._payment, ..._paymentDes };
  }

  async paymentInstallment(data: CreateInstallmentDto, userAuth) {
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
      let user;
      if (userAuth) {
        user = await this.userRepo.findOne({
          select: userSelector,
          join: userJoiner,
          where: { [`${Table.USERS}.user_id`]: userAuth.user_id },
        });

        if (!user) {
          throw new HttpException(
            'Người dùng hiện tại không thể tạo đơn.',
            401,
          );
        }
      } else {
        user = await this.userRepo.findOne({
          select: userSelector,
          join: userJoiner,
          where: { [`${Table.USERS}.phone`]: data['s_phone'] },
        });
        if (!user) {
          await this.customerService.createCustomerFromWebPayment(data);
          user = await this.userRepo.findOne({
            select: userSelector,
            join: userJoiner,
            where: { phone: data['s_phone'] },
          });
        }
        if (!user['user_appcore_id']) {
          throw new HttpException('Tạo đơn thất bại', 401);
        }
      }

      let totalPrice = product['price'];
      let subtotal = +totalPrice;
      let cartItems = [{ ...product, amount: 1 }];

      if (data.shipping_fee_location_id) {
        let shippingFeeLocation = await this.shippingFeeLocationRepo.findOne({
          select: '*',
          join: shippingFeeLocationsJoiner,
          where: {
            [`${Table.SHIPPING_FEE_LOCATION}.shipping_fee_location_id`]:
              data.shipping_fee_location_id,
          },
        });

        if (
          shippingFeeLocation &&
          +totalPrice < +shippingFeeLocation.max_value
        ) {
          subtotal = +subtotal + +shippingFeeLocation.value_fee;
        }
      }

      let responseData;

      let gatewayName = GatewayName.HD_Saigon;
      let installed_money_account_id = GatewayAppcoreId.HD_Saigon;
      switch (+data.company_id) {
        case 1:
          installed_money_account_id = GatewayAppcoreId.HD_Saigon;
          responseData = calculateInstallmentInterestRateHDSaiGon(
            subtotal,
            data.prepaid_percentage,
            data.tenor,
          );
          gatewayName = GatewayName.HD_Saigon;
          break; //HD Saigon
        case 2:
          installed_money_account_id = GatewayAppcoreId.Home_Credit;
          responseData = calculateInstallmentInterestRateHomeCredit(
            subtotal,
            data.prepaid_percentage,
            data.tenor,
          );
          gatewayName = GatewayName.Home_Credit;
          break; // Home Credit
        case 3:
          installed_money_account_id = GatewayAppcoreId.Shinhan;
          responseData = calculateInstallmentInterestRateHDSaiGon(
            subtotal,
            data.prepaid_percentage,
            data.tenor,
          );
          gatewayName = GatewayName.Shinhan;
          break; //Shinhan
      }

      let paymentPerMonth = responseData.paymentPerMonth;
      let totalInterest = responseData.totalInterest;
      let interestPerMonth = responseData.interestPerMonth;
      let prepaidAmount = responseData.prepaidAmount;

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
        total_price: totalPrice,
        transfer_amount: subtotal,
        subtotal,
        pay_credit_type: 4,
        installed_tenor: data.tenor,
        installed_prepaid_amount: prepaidAmount,
        installment_interest_rate_code: totalInterest,
        installed_money_amount: paymentPerMonth,
        installed_money_account_id,
        ref_order_id: refOrderId,
        installmentCode: refOrderId,
        payment_status: PaymentStatus.success,
      };

      const result = await this.orderService.createOrder(user, sendData);

      await this.orderPaymentRepo.create({
        order_id: result['order_id'],
        order_no: refOrderId,
        gateway_name: gatewayName,
        amount: subtotal,
      });

      const paymentAppcoreData = {
        installmentAccountId: installed_money_account_id,
        installmentCode: refOrderId,
        paymentStatus: 'success',
        totalAmount: +subtotal,
      };

      await axios({
        method: 'PUT',
        url: UPDATE_ORDER_PAYMENT(result['order_code']),
        data: paymentAppcoreData,
      });

      await this.orderRepo.update(
        { order_id: result['order_id'] },
        {
          status: OrderStatus.purchased,
          updated_date: formatStandardTimeStamp(),
        },
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async payooPaymentPaynow(data: CreatePayooPaynowDto) {
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
      let cart;
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
        cart = await this.cartRepo.findOne({ user_id: data['user_id'] });
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

      // Check coupon if it exist
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
          select: userSelector,
          join: userJoiner,
          where: { [`${Table.USERS}.user_id`]: userAuth.user_id },
        });
        if (!user) {
          throw new HttpException('Không tìm thấy người dùng', 404);
        }
      } else {
        if (data.user_id) {
          user = await this.userRepo.findOne({
            select: userSelector,
            join: userJoiner,
            where: { [`${Table.USERS}.user_id`]: data.user_id },
          });
        }

        if (!user) {
          user = await this.userRepo.findOne({
            select: userSelector,
            join: userJoiner,
            where: {
              [`${Table.USERS}.phone`]:
                method === 'selfTransport' ? data['b_phone'] : data['s_phone'],
            },
          });
          if (!user) {
            await this.customerService.createCustomerFromWebPayment(data);
            user = await this.userRepo.findOne({
              select: userSelector,
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
      let payCreditType = 1;

      let sendData = {
        user_id: user.user_id,
        user_appcore_id: user.user_appcore_id,
        order_items: cartItems,
        ref_order_id,
        pay_credit_type: payCreditType,
        transfer_amount: +totalPrice,
        coupon_code: data.coupon_code ? data.coupon_code : null,
        order_type: OrderType.online,
      };

      switch (method) {
        case 'paynow':
          payCreditType = 2;
          break;
        case 'selfTransport':
          payCreditType = 1;
          break;
        case 'installment':
          payCreditType = 4;
          break;
      }
      sendData['pay_credit_type'] = payCreditType;

      if (['paynow', 'installment'].includes(method)) {
        sendData['s_phone'] = data.s_phone;
        sendData['s_lastname'] = data.s_lastname;
        sendData['s_city'] = data.s_city;
        sendData['s_district'] = data.s_district;
        sendData['s_ward'] = data.s_ward;
        sendData['s_address'] = data.s_address;
      }

      if (method === 'selfTransport') {
        sendData['b_phone'] = data.b_phone;
        sendData['b_lastname'] = data.b_lastname;
      }

      if (data.shipping_fee_location_id) {
        let shippingFeeLocation = await this.shippingFeeLocationRepo.findOne({
          select: '*',
          join: shippingFeeLocationsJoiner,
          where: {
            [`${Table.SHIPPING_FEE_LOCATION}.shipping_fee_location_id`]:
              data.shipping_fee_location_id,
          },
        });

        if (
          shippingFeeLocation &&
          +totalPrice < +shippingFeeLocation.max_value
        ) {
          sendData['shipping_cost'] = +shippingFeeLocation.value_fee;
          sendData['transfer_amount'] =
            +totalPrice + +shippingFeeLocation.value_fee;
          totalPrice = +totalPrice + +shippingFeeLocation.value_fee;
        }
      }

      if (method === 'selfTransport') {
        sendData['store_id'] = data.store_id;
        sendData['order_type'] = 3;
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
        gateway_name: GatewayName.Payoo,
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

      if (cart) {
        await this.cartRepo.delete({ cart_id: cart.cart_id });
        await this.cartItemRepo.delete({ cart_id: cart.cart_id });
      }

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
        updated_date: formatStandardTimeStamp(),
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

      await this.orderService.updateAppcoreOrderPayment(
        order.order_id,
        GatewayName.Payoo,
      );
    } catch (error) {
      throw new HttpException('VERIFY_SIGNATURE_FAIL', 400);
    }
  }

  async momoNotify(data) {
    const updatedOrderPayment = await this.orderPaymentRepo.update(
      { order_no: data['orderId'] },
      {
        order_gateway_id: data['transId'],
        payment_code: data['transId'],
        errormsg: data['message'],
        checksum: data['signature'],
        amount: data['amount'],
        expiry_date: formatStandardTimeStamp(
          new Date(data['responseTime'] + 30 * 86400 * 1000),
        ),
        payment_type: data['payType'],
      },
      true,
    );
    if (!updatedOrderPayment['order_id']) {
      return;
    }
    try {
      await this.orderService.updateAppcoreOrderPayment(
        updatedOrderPayment.order_id,
        GatewayName.Momo,
      );
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
      case 3: {
        // Shinhan
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
    }
  }

  async momoPayment(data: CreateMomoPaymentDto) {
    //Check user
    let user;
    if (data.user_id) {
      user = await this.userRepo.findOne({
        select: userSelector,
        join: userJoiner,
        where: { [`${Table.USERS}.user_id`]: data.user_id },
      });
    }
    if (!user) {
      user = await this.userRepo.findOne({
        select: userSelector,
        join: userJoiner,
        where: {
          [`${Table.USERS}.phone`]: data['s_phone'],
        },
      });
      if (!user) {
        await this.customerService.createCustomerFromWebPayment(data);
        user = await this.userRepo.findOne({
          select: userSelector,
          join: userJoiner,
          where: {
            [`${Table.USERS}.phone`]: data['s_phone'],
          },
        });
      }
    }
    let cartItems = [];
    let cart = await this.cartRepo.findOne({ user_id: data['user_id'] });
    if (!cart) {
      throw new HttpException('Không tìm thấy giỏ hàng', 404);
    }
    cartItems = await this.cartItemRepo.find({
      select: `*, ${Table.CART_ITEMS}.amount`,
      join: cartPaymentJoiner,
      where: { [`${Table.CART_ITEMS}.cart_id`]: cart.cart_id },
    });
    let totalPrice = cartItems.reduce(
      (acc, ele) => acc + ele.price * ele.amount,
      0,
    );
    let ref_order_id = generateRandomString();
    let payCreditType = 2;
    let sendData: any = {
      user_id: user.user_id,
      user_appcore_id: user.user_appcore_id,
      s_phone: data.s_phone,
      s_lastname: data.s_lastname,
      s_city: data.s_city,
      s_district: data.s_district,
      s_ward: data.s_ward,
      s_address: data.s_address,
      order_items: cartItems,
      ref_order_id,
      pay_credit_type: payCreditType,
      coupon_code: data.coupon_code ? data.coupon_code : null,
      order_type: OrderType.online,
      callback_url: data.callback_url,
    };
    //Check coupon if it exist
    if (data.coupon_code) {
      let checkCouponData = {
        store_id: 67107,
        coupon_code: data['coupon_code'],
        coupon_programing_id: 'HELLO_123',
        phone: data.s_phone,
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
    //Check shipping fee
    if (data.shipping_fee_location_id) {
      let shippingFeeLocation = await this.shippingFeeLocationRepo.findOne({
        select: '*',
        join: shippingFeeLocationsJoiner,
        where: {
          [`${Table.SHIPPING_FEE_LOCATION}.shipping_fee_location_id`]:
            data.shipping_fee_location_id,
        },
      });
      if (shippingFeeLocation && +totalPrice < +shippingFeeLocation.max_value) {
        sendData['shipping_cost'] = +shippingFeeLocation.value_fee;
        sendData['transfer_amount'] =
          +totalPrice + +shippingFeeLocation.value_fee;
        totalPrice = +totalPrice + +shippingFeeLocation.value_fee;
      }
    }
    sendData['transfer_amount'] = +totalPrice;

    const responseData = await this.requestPaymentMomo(sendData);

    sendData['paymentStatus'] = PaymentStatus.new;

    const newOrder = await this.orderService.createOrder(user, sendData);

    await this.orderPaymentRepo.create({
      order_id: newOrder['order_id'],
      order_no: responseData['orderId'],
      gateway_name: GatewayName.Momo,
      amount: +totalPrice,
      payment_code: responseData.resultCode,
      errormsg: responseData.message,
      payment_url: responseData.payUrl,
    });
    return responseData;
  }

  async momoPaymentSelftransport(data: CreateMomoPaymentSelfTransportDto) {
    //Check user
    let user;
    if (data.user_id) {
      user = await this.userRepo.findOne({
        select: userSelector,
        join: userJoiner,
        where: { [`${Table.USERS}.user_id`]: data.user_id },
      });
    }
    if (!user) {
      user = await this.userRepo.findOne({
        select: userSelector,
        join: userJoiner,
        where: {
          [`${Table.USERS}.phone`]: data['b_phone'],
        },
      });
      if (!user) {
        await this.customerService.createCustomerFromWebPayment(data);
        user = await this.userRepo.findOne({
          select: userSelector,
          join: userJoiner,
          where: {
            [`${Table.USERS}.phone`]: data['b_phone'],
          },
        });
      }
    }
    let cartItems = [];
    let cart = await this.cartRepo.findOne({ user_id: data['user_id'] });
    if (!cart) {
      throw new HttpException('Không tìm thấy giỏ hàng', 404);
    }
    cartItems = await this.cartItemRepo.find({
      select: `*, ${Table.CART_ITEMS}.amount`,
      join: cartPaymentJoiner,
      where: { [`${Table.CART_ITEMS}.cart_id`]: cart.cart_id },
    });
    let totalPrice = cartItems.reduce(
      (acc, ele) => acc + ele.price * ele.amount,
      0,
    );
    let ref_order_id = generateRandomString();
    let payCreditType = 2;
    let sendData: any = {
      user_id: user.user_id,
      user_appcore_id: user.user_appcore_id,
      b_phone: data.b_phone,
      b_lastname: data.b_lastname,
      order_type: OrderType.buyAtStore,
      order_items: cartItems,
      ref_order_id,
      pay_credit_type: payCreditType,
      coupon_code: data.coupon_code ? data.coupon_code : null,
      callback_url: data.callback_url,
      store_id: data.store_id,
    };
    //Check coupon if it exist
    if (data.coupon_code) {
      let checkCouponData = {
        store_id: 67107,
        coupon_code: data['coupon_code'],
        coupon_programing_id: 'HELLO_123',
        phone: data['b_phone'],
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

    sendData['transfer_amount'] = +totalPrice;

    const responseData = await this.requestPaymentMomo(sendData);

    sendData['paymentStatus'] = PaymentStatus.new;

    const newOrder = await this.orderService.createOrder(user, sendData);

    await this.orderPaymentRepo.create({
      order_id: newOrder['order_id'],
      order_no: responseData['orderId'],
      gateway_name: GatewayName.Momo,
      amount: +totalPrice,
      payment_code: responseData.resultCode,
      errormsg: responseData.message,
      payment_url: responseData.payUrl,
    });
    return responseData;
  }

  async requestPaymentMomo(data) {
    const partnerCode = MOMO_PARTNER_CODE;
    const accessKey = MOMO_ACCESS_KEY;
    const secretkey = MOMO_SECRET_KEY;
    const requestId = data['ref_order_id'];
    const orderId = data['ref_order_id'];
    const orderInfo = 'Pay with MoMo';
    const redirectUrl = momoRedirectUrl(data['callback_url']);
    const ipnUrl = momoIpnUrl;
    const amount = data['transfer_amount'];
    const requestType = 'captureWallet';
    const cryptography = new Cryptography();
    const extraData = cryptography.encodeBase64(
      JSON.stringify({
        b_lastname: data['b_lastname'],
        b_phone: data['b_phone'],
      }),
    );

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;

    var signature = cryptography.generateSHA512(rawSignature, secretkey);

    //json object send to MoMo endpoint
    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    };
    try {
      console.log('4');
      const response = await axios({
        url: MOMO_PAYMENT,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: requestBody,
      });

      if (!response?.data) {
        throw new HttpException(
          'Kết nối thanh toán đến ví momo không thành công.',
          404,
        );
      }

      return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error?.response?.data?.message || error.response,
        error?.response?.status || error.status,
      );
    }
  }

  async websiteCreateOrderCOD(data, userAuth) {
    let user: any;
    if (userAuth) {
      user = await this.userRepo.findOne({ user_id: userAuth.user_id });

      if (!user.phone) {
        throw new HttpException('Vui lòng cập nhập số điện thoại', 400);
      }
      if (!user['user_appcore_id']) {
        await this.customerService.createCustomerToAppcore(user);
        user = await this.userRepo.findOne({ user_id: userAuth.user_id });
      }
      if (!user) {
        throw new HttpException(
          'Có lỗi trong quá trình tạo đơn hàng, vui lòng liên hệ quản trị viên',
          400,
        );
      }
    } else {
      user = await this.userRepo.findOne({
        select: '*',
        join: userPaymentJoiner,
        where: { phone: data.s_phone },
      });

      if (!user) {
        let { passwordHash, salt } = saltHashPassword(defaultPassword);
        let userData = {
          ...new UserEntity(),
          lastname: data.s_lastname,
          password: passwordHash,
          phone: data.s_phone,
          salt,
          user_type: UserTypeEnum.Customer,
        };
        let newUser = await this.userRepo.create(userData);

        let userProfileData = {
          ...new UserProfileEntity(),
          b_lastname: data.s_lastname,
          s_lastname: data.s_lastname,
          b_phone: data.s_phone,
          s_phone: data.s_phone,
          b_city: data.s_city,
          s_city: data.s_city,
          b_district: data.s_district,
          s_district: data.s_district,
          b_ward: data.s_ward,
          s_ward: data.s_ward,
          b_address: data.s_address,
          s_address: data.s_address,
          user_id: newUser.user_id,
        };
        await this.userProfileRepo.create(userProfileData, false);

        await this.userLoyaltyRepo.create({
          ...new UserLoyaltyEntity(),
          user_id: newUser.user_id,
        });
        await this.userDataRepo.create({
          ...new UserDataEntity(),
          user_id: newUser.user_id,
        });

        user = await this.userRepo.findOne({
          select: '*',
          join: userPaymentJoiner,
          where: { [`${Table.USERS}.user_id`]: newUser.user_id },
        });

        user = await this.customerService.createCustomerToAppcore(user);
      }
    }

    if (!user['user_appcore_id']) {
      throw new HttpException(
        'Người dùng hiện tại không thể thực hiện tạo đơn hàng, vui lòng liên hệ với nhân viên để được hỗ trợ',
        409,
      );
    }

    const cart = await this.cartRepo.findOne({
      user_id: userAuth ? userAuth.user_id : data.user_id,
    });
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

    if (!cartItems.length) {
      throw new HttpException('Không tìm thấy sản phẩm trong giỏ hàng', 404);
    }

    let userProfile = await this.userProfileRepo.findOne({
      user_id: user.user_id,
    });

    // await this.createOrder(user, sendData);
    userProfile['s_firstname'] = '';
    userProfile['b_firstname'] = '';
    userProfile['s_lastname'] = data.s_lastname || userProfile['s_lastname'];
    userProfile['s_phone'] = data.s_phone || userProfile['s_phone'];
    userProfile['s_city'] = data.s_city || userProfile['s_city'];
    userProfile['s_district'] = data.s_district || userProfile['s_district'];
    userProfile['s_ward'] = data.s_ward || userProfile['s_ward'];
    userProfile['s_address'] = data.s_address || userProfile['s_address'];
    if (!userProfile['b_lastname']) {
      userProfile['b_lastname'] = data.s_lastname;
    }

    if (Object.entries(userProfile).length) {
      userProfile = await this.userProfileRepo.update(
        { user_id: user.user_id },
        userProfile,
        true,
      );
    }

    const sendData = {
      ...userProfile,
      user_appcore_id: user['user_appcore_id'],
      order_items: cartItems,
    };

    if (data.shipping_fee_location_id) {
      let shippingFeeLocation = await this.shippingFeeLocationRepo.findOne({
        select: '*',
        join: shippingFeeLocationsJoiner,
        where: { shipping_fee_location_id: data.shipping_fee_location_id },
      });
      if (shippingFeeLocation && +totalPrice < +shippingFeeLocation.max_value) {
        sendData['shipping_cost'] = shippingFeeLocation.value_fee;
      }
    }

    const result = await this.orderService.createOrder(user, sendData);

    await this.cartRepo.delete({ cart_id: cart.cart_id });
    await this.cartItemRepo.delete({ cart_id: cart.cart_id });
    return result;
  }
}
