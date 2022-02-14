import { IUser } from './users.interface';
import { UserGroupPrivilegeEntity } from '../entities/usergroupPrivilege.entity';

export interface IResponse {
  statusCode?: number;
  data?: any;
  message?: string;
}

export interface IResponseUserToken {
  token: string;
  userData: IUser;
  permission: string;
  menu: UserGroupPrivilegeEntity[];
}
