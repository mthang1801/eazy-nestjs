export class IUserMenu {
  privilege_id: number;
  usergroup_id: number;
  privilege: string;
  description: string;
  parent_id: number;
  level: number;
  route: string;
  method: string;
  icon: string;
  children?: IUserMenu[];
}
