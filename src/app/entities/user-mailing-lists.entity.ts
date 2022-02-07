export class UserMailingListsEntity {
  subscriber_id: number;
  list_id: number;
  activation_key: string;
  unsubscribe_key: string;
  confirmed: number;
  expired_at: Date;
}
