export class OrderDetailsEntity {
  item_id: number = 0;
  order_id: null | string;
  product_id: string = '0';
  product_code: string = '';
  price: number = 0;
  amount: number = 0;
  extra: string = '';
}
