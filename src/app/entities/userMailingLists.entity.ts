export class UserMailingListsEntity {
  list_id: number = 0;
  subscriber_id: number = 0;
  activation_key: string = '';
  unsubscribe_key: string = '';
  type: string = '';
  status: string = 'A';
  confirmed: number = 0;
  expired_at: Date;
}
