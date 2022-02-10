export interface IUserMailingLists {
  subscriber_id: number;
  list_id: number;
  activation_key: string;
  unsubcribe_key: string;
  confirmed: number;
  timestamp: Date;
}
