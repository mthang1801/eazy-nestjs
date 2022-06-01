import * as moment from 'moment';
import { formatStandardTimeStamp } from '../utils/helper';
const orderSampleData = {
  b_firstname: 'Mai Van',
  b_lastname: 'Thang',
  b_email: 'mthang@email.com',
  b_city: '266',
  b_district: '375',
  b_ward: '11787',
  b_address: '123 Nguyễn Văn Linh',
  b_phone: '0939524499',
  user_id: '100008754',
  notes:
    'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, comes from a line in section 1.10.32.',
  store_id: 67107,
  utm_source: 10,
  order_type: 1,
  status: '0',
  payment_status: 1,
  warranty_note: 'Bao hanh 6 thang',

  discount_type: 1,
  discount: 0,

  order_items: [
    {
      product_id: '50000173',
      price: 29900000,
      amount: 2,
      discount_type: 1,
      discount_amount: 0,
      product_type: 1,
      imei_code: '12732189070',
      repurchase_price: 27990000,
      note: 'product',
    },
    {
      product_id: '50000174',
      price: 29900000,
      amount: 1,
    },
    {
      product_id: '50000178',
      price: 13990000,
      amount: 2,
    },
  ],
  internal_note: 'Internal note',

  shipping_id: 'AWS327189323213213',
  shipping_cost: 35000,
  shipping_fee: 22000,

  cash_account_id: 23013821,
  disposit_amount: 0,

  transfer_amount: 5000000,
  transfer_account_id: 12321312,
  transfer_ref_code: '32132143AAAS21',

  credit_account_id: 2137890213,
  credit_amount: 500000,
  credit_code: '3219AOIUQWO',
  credit_card_no: '1234',
  credit_fee_account_id: 38721897,

  pay_credit_type: 1,

  installed_money_amount: 123,
  installed_money_code: '32131290',
  installed_money_account_id: '123873912012739',
  id_card: '23190280912',

  coupon_code: '2313213',
  ref_order_id: 'null',

  is_sent_customer_address: 1,
  s_firstname: 'Nguyen hoang',
  s_lastname: 'Giang',
  s_address: '789/2A Co Giang',
  s_phone: '0939333333',
  s_city: '266',
  s_district: '375',
  s_ward: '11787',
};

export const convertDataToIntegrate = (data) => {
  let itgData = {};
  itgData['loanInformation'] = {};
  let loanInformation = itgData['loanInformation'];

  itgData['storeId'] = data['store_id'] || 67107; //Mã cửa hàng *

  itgData['orderSource'] = data['utm_source']; //Kênh đặt *

  if (data['order_type']) {
    itgData['orderType'] = data['order_type'] == 1 ? 1 : 5; //Loại đơn
  }

  if (data['installed_money_account_id']) {
    itgData['installmentAccountId'] = data['installed_money_account_id'];
  }

  if (data['installed_money_code']) {
    itgData['installmentCode'] = data['installed_money_code'];
  }

  if (data['payment_status'] == 2) {
    itgData['paymentStatus'] = data['payment_status'];
  }

  if (data['status']) {
    itgData['status'] = data['status'];
  }

  if (data['shipping_id']) {
    itgData['codeShip'] = data['shipping_id']; //Mã vận đơn
  }

  itgData['customerId'] = data['user_appcore_id']; //Mã user *

  if (data['employee_id']) {
    itgData['saleId'] = data['employee_id']; //Mã nhân viên *
  }

  if (data['internal_note']) {
    itgData['saleNote'] = data['internal_note']; //Ghi chú chăm sóc khách hàng
  }

  if (data['b_phone']) {
    itgData['customerMobile'] = data['b_phone']; // Số điện thoại khách hàng
  }

  if (data['b_lastname']) {
    itgData['customerName'] = data['b_lastname']; //Tên khách hàng
  }

  if (data['b_address']) {
    itgData['customerAddress'] = data['b_address']; //Địa chỉ khách hàng
  }

  if (data['b_city']) {
    itgData['customerCityName'] = data['b_city']; //Lấy id thành phố
  }

  if (data['b_district']) {
    itgData['customerDistrictName'] = data['b_district']; //Lấy id quận
  }

  if (data['b_ward']) {
    itgData['customerWardName'] = data['b_ward']; //Lấy id huyện
  }

  if (data['s_lastname']) {
    itgData['receivingFullName'] = data['s_lastname']; // tên người nhận
  }

  if (data['s_phone']) {
    itgData['receivingPhone'] = data['s_phone']; // sdt người nhận
  }

  if (data['s_city']) {
    itgData['receivingCity'] = +data['s_city']; // thành phố nhận
  }

  if (data['s_district']) {
    itgData['receivingDistrict'] = +data['s_district']; // quận nhận
  }

  if (data['s_ward']) {
    itgData['receivingWard'] = +data['s_ward']; // phường nhận
  }

  if (data['s_address']) {
    itgData['receivingAddress'] = data['s_address']; // địa chỉ nhận hàng
  }

  if (data['note']) {
    itgData['customerNote'] = data['note']; // Ghi chú khách hàng
  }

  if (data['shipping_fee']) {
    itgData['shipFee'] = +data['shipping_fee']; //Phí ship của hãng vận chuyển
  }

  if (data['shipping_cost']) {
    itgData['customerShipFee'] = +data['shipping_cost']; // Phí trả khách hàng phải trả
  }

  if (data['disposit_amount']) {
    itgData['depositAmount'] = data['disposit_amount']; // Tiền đặt cọc (Tiền mặt)
  }

  if (data['cash_account_id']) {
    itgData['cashAccountId'] = data['cash_account_id']; // Mã tài khoản tiền mặt
  }

  if (data['transfer_amount']) {
    itgData['transferAmount'] = data['transfer_amount']; // Tiền chuyển khoản
  }

  if (data['transfer_account_id']) {
    itgData['transferAccountId'] = data['transfer_account_id']; //Mã tiền chuyển khoản
  }

  if (data['transfer_ref_code']) {
    itgData['transferReferenceCode'] = data['transfer_ref_code']; // Mã chuyển khoản
  }

  if (data['credit_amount']) {
    itgData['creditAmount'] = data['credit_amount']; // Tiền quẹt thẻ
  }

  if (data['credit_account_id']) {
    itgData['creditFeeAccountId'] = data['credit_account_id']; // Mã tài khoản quẹt thẻ
  }

  if (data['credit_code']) {
    itgData['creditCode'] = data['credit_code']; // Mã quẹt thẻ
  }

  if (data['credit_card_no']) {
    itgData['creditCardNo'] = data['credit_card_no']; // Mã 4 số cuối của thẻ
  }

  if (data['installed_money_amount']) {
    itgData['installedMoneyAmount'] = data['installed_money_amount']; // Tiền trả góp
  }

  if (data['installed_money_account_id']) {
    itgData['installMoneyAccountId'] = data['installed_money_account_id']; // Mã tài khoản trả góp
  }

  if (data['installed_money_code']) {
    itgData['installMoneyCode'] = data['installed_money_code']; //Mã trả góp
  }

  if (data['pay_credit_type']) {
    itgData['payCreditFeeType'] = data['pay_credit_type']; //Hình thức trả phí khác
  }

  if (data['coupon_code']) {
    itgData['couponCode'] = data['coupon_code']; //Mã coupon
  }

  if (data['payment_status']) {
    itgData['parnerPaymentStatus'] = data['payment_status']; //Trạng thái thanh toán
  }

  if (data['email']) {
    itgData['customerEmail'] = data['email']; //Địa chỉ email khách hàng
  }

  if (data['gender']) {
    itgData['customerGender'] = data['gender']; //Giới tính khách hàng
  }

  if (data['id_card']) {
    itgData['customerIdCard'] = data['id_card']; // CMND khách hàng
  }

  itgData['refOrderId'] = data['ref_order_id']; //Mã đơn hàng của đối tác *

  if (data['discount_type']) {
    itgData['discountType'] = data['discount_type']; //Kiểu chiết khấu
  }

  if (data['installment_tenor_code']) {
    itgData['installmentInterestRateValue'] = data['installment_interest_rate'];
  }

  if (data['discount']) {
    itgData['discountAmount'] = data['discount']; //Số tiền chiết khấu hoặc phần trăm
  }

  if (data['payment_date']) {
    itgData['paymentDate'] = formatStandardTimeStamp(data['payment_date']);
  }

  itgData['isSentToCustomerAddress'] =
    data['is_sent_customer_address'] == 0 ? false : true; // có gửi địa chỉ khác hay ko

  // Lấy danh sách Order Items
  for (let orderItem of data['order_items']) {
    let cvOrderItem = {};

    cvOrderItem['productId'] = orderItem['product_id']; //Mã SP

    cvOrderItem['productPrice'] = orderItem['price']; // Đơn giá SP

    cvOrderItem['quantity'] = orderItem['amount']; //Số lượng

    if (orderItem['discount_amout']) {
      cvOrderItem['discountAmount'] = orderItem['discount_amout']; // Giảm giá
    }

    if (orderItem['product_type']) {
      cvOrderItem['productType'] = orderItem['product_type']; //Loại SP
    }

    if (orderItem['imei_code']) {
      cvOrderItem['imeiCode'] = orderItem['imei_code']; // Imei Code
    }

    if (orderItem['repurchase_price']) {
      cvOrderItem['repurchasePrice'] = orderItem['repurchase_price']; // Giá mua lại
    }

    if (orderItem['note']) {
      cvOrderItem['note'] = orderItem['note']; // Ghi chú SP
    }

    itgData['orderItems'] = itgData['orderItems']
      ? [...itgData['orderItems'], cvOrderItem]
      : [cvOrderItem];
  }

  return JSON.stringify(itgData);
};

export const OrderStatus = {
  unfulfilled: 0,
  new: 1,
  confirmed: 3,
  shipping: 4,
  packaging: 5,
  success: 6,
  failed: 7,
  cancelled: 8,
  purchased: 9,
  dont_pickup_phone: 10,
  invalid: 11,
};

export const OrderType = {
  buyAtStore: 1,
  preOrder: 2,
  online: 3,
};
