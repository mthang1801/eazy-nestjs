export class OrderPaymentEntity {
  order_payment_id: number = 0;
  order_id: number = 0;
  order_gateway_id: number = 0;
  order_no: string = '';
  amount: number = 0;
  payment_code: string = '';
  errorcode: number = null;
  errormsg: string = '';
  checksum: string = '';
  expiry_date: string = null;
  token: string = '';
  payment_url: string = '';
  qr_code_uri: string = '';
  qrcode: string = '';
}
