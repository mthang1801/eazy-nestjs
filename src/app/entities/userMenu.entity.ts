export class UserMenuEntity {
  privilege_id: number = 0;
  usergroup_id: number = 0;
  privilege: string = '';
  description: string = '';
  parent_id: number = 0;
  level: number = 1;
  route: string = '';
  method: string = 'GET';
  icon: string = '';
  children?: UserMenuEntity[];
}
