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
  status: 1,
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

  shipping_ids: 'AWS327189323213213',
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

  is_sent_customer_address: 0,
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

  itgData['storeId'] = data['store_id']; //Mã cửa hàng *

  itgData['orderSource'] = data['utm_source']; //Kênh đặt

  itgData['orderType'] = data['order_type']; //Loại đơn

  itgData['status'] = data['status']; //Trạng thái đơn hàng *

  itgData['codeShip'] = data['shipping_ids']; //Mã vận đơn

  itgData['customerId'] = data['user_id']; //Mã user *

  itgData['saleId'] = data['employee_id']; //Mã nhân viên *

  itgData['saleNote'] = data['internal_note']; //Ghi chú chăm sóc khách hàng

  itgData['customerMobile'] = data['b_phone']; // Số điện thoại khách hàng

  itgData['customerName'] =
    data['b_firstname'].trim() + ` ` + data['b_lastname']; //Tên khách hàng

  itgData['customerAddress'] = data['b_address']; //Địa chỉ khách hàng

  itgData['customerCityName'] = data['b_city']; //Lấy id thành phố

  itgData['customerDistrictName'] = data['b_district']; //Lấy id quận

  itgData['customerWardName'] = data['b_ward']; //Lấy id huyện

  itgData['customerNote'] = data['note']; // Ghi chú khách hàng

  itgData['shipFee'] = data['shipping_fee']; //Phí ship của hãng vận chuyển

  itgData['customerShipFee'] = data['shipping_cost']; // Phí trả khách hàng phải trả

  itgData['depositAmount'] = data['disposit_amount']; // Tiền đặt cọc (Tiền mặt)

  itgData['cashAccountId'] = data['cash_account_id']; // Mã tài khoản tiền mặt

  itgData['transferAmount'] = data['transfer_amount']; // Tiền chuyển khoản

  itgData['transferAccountId'] = data['transfer_account_id']; //Mã tiền chuyển khoản

  itgData['transferReferenceCode'] = data['transfer_ref_code']; // Mã chuyển khoản

  itgData['creditAmount'] = data['credit_amount']; // Tiền quẹt thẻ

  itgData['creditAccountId'] = data['credit_account_id']; // Mã tài khoản quẹt thẻ

  itgData['creditCode'] = data['credit_code']; // Mã quẹt thẻ

  itgData['creditCardNo'] = data['credit_card_no']; // Mã 4 số cuối của thẻ

  itgData['installedMoneyAmount'] = data['installed_money_amount']; // Tiền trả góp

  itgData['installMoneyAccountId'] = data['installed_money_account_id']; // Mã tài khoản trả góp

  itgData['installMoneyCode'] = data['installed_money_code']; //Mã trả góp

  itgData['payCreditFeeType'] = data['pay_credit_type']; //Hình thức trả phí khác

  itgData['couponCode'] = data['coupon_code'] || ''; //Mã coupon

  itgData['parnerPaymentStatus'] = data['payment_status'] || 1; //Trạng thái thanh toán

  itgData['customerEmail'] = data['email'] || ''; //Địa chỉ email khách hàng

  itgData['customerGender'] = data['gender'] || 0; //Giới tính khách hàng

  itgData['customerIdCard'] = data['id_card'] || ''; // CMND khách hàng

  itgData['refOrderId'] = data['ref_order_id'] || '0'; //Mã đơn hàng của đối tác

  itgData['discountType'] = data['discount_type'] || 1; //Kiểu chiết khấu

  itgData['discountAmount'] = data['discount'] || 0; //Số tiền chiết khấu hoặc phần trăm

  itgData['isSentToCustomerAddress'] =
    data['is_sent_customer_address'] === 0 ? false : true;

  itgData['receivingFullName'] =
    data['s_firstname'].trim() + ` ` + data['s_lastname'];

  itgData['recevingPhone'] = data['s_phone'];

  itgData['recevingCity'] = data['s_city'];

  itgData['receivingDistrict'] = data['s_district'];

  itgData['receivingWard'] = data['s_ward'];

  itgData['receivingAddress'] = data['s_address'];

  // Lấy danh sách Order Items
  for (let orderItem of data['order_items']) {
    let cvOrderItem = {};

    cvOrderItem['productId'] = orderItem['product_id'];

    cvOrderItem['productPrice'] = orderItem['price'];

    cvOrderItem['quantity'] = orderItem['amount'];

    cvOrderItem['discountAmount'] = orderItem['discount_amout'] || 0;

    cvOrderItem['productType'] = orderItem['product_type'] || 1;

    cvOrderItem['imeiCode'] = orderItem['imei_code'] || '';

    cvOrderItem['repurchasePrice'] = orderItem['repurchase_price'] || 0;

    cvOrderItem['note'] = orderItem['note'] || '';

    itgData['orderItems'] = itgData['orderItems']
      ? [...itgData['orderItems'], cvOrderItem]
      : [cvOrderItem];
  }

  return JSON.stringify(itgData);
};
