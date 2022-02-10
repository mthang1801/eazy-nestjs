import { IUserGroup } from './usergroups.interface';
import { IUser } from './users.interface';

export interface IUserGroupLink {
  link_id?: number;
  user_id: number;
  usergroup_id: number;
  status: string;
}

export interface IUserGroupLinkExtend
  extends IUserGroupLink,
    IUser,
    IUserGroup {
  link_id?: number;
  user_id: number;
  usergroup_id: number;
  status: string;
}
