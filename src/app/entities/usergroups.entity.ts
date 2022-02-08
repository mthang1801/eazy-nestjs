export class UserGroupEntity {
  usergroup_id: number = 0;
  status: string = '';
  type: string = '';
  company_id: number = 0;
}

export class UserGroupPrivilegeEntity {
  privilege_id: number = 0;
  usergroup_id: number = 0;
  privilege: string = '';
  description: string = '';
  parent_id: number = 0;
  level: number = 0;
  route: string = '';
  method: string = '';
  icon: string = '';
}

export class UserGroupLinkEntity {
  link_id: number = 0;
  user_id: number = 0;
  usergroup_id: number = 0;
  status: string = '';
}

export class UserGroupDescriptionEntity {
  usergroup_id: number = 0;
  lang_code: string = '';
  usergroup: string = '';
}
