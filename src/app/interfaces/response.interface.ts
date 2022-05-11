import { IUser } from './users.interface';
import { RoleFunctionEntity } from '../entities/roleFunction.entity';

export interface IResponse {
  statusCode?: number;
  data?: any;
  message?: string;
}

export interface IResponseUserToken {
  token: string;
  userData: IUser;
  menu: RoleFunctionEntity[];
}
