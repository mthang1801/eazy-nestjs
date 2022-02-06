export interface IUserGroup {
  usergroup_id: number;
  status: string;
  type: string;
  company_id: number;
}

export interface IUserGroupPrivilege {
  usergroup_id: number;
  privilege: string;
  description: string;
}

export interface IUserGroupLink {
  link_id?: number;
  user_id: number;
  usergroup_id: number;
  status: string;
}

export interface IUserGroupDescription {
  usergroup_id: number;
  langcode: string;
  usergroup: string;
}

export interface IUserGroupInfo
  extends IUserGroup,
    IUserGroupLink,
    IUserGroupDescription {}
