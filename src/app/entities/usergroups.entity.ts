export class UserGroupEntity {
  usergroup_id: number = 0;
  status: string = '';
  type: string = '';
  company_id: number = 0;
}

export class UserGroupDescriptionEntity {
  usergroup_id: number = 0;
  lang_code: string = '';
  usergroup: string = '';
}
