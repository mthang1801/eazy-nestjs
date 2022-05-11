export class FunctEntity {
  privilege_id: number = 0;
  privilege: string = '';
  description: string = '';
  parent_id: null | number = 0;
  level: number = 0;
  is_default: string = 'Y';
  section_id: string = '';
  group_id: string = '';
  is_view: string = 'N';
  route: string = '';
  method: string = 'GET';
  icon: string = '';
}
