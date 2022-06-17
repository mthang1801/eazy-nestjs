import { Table } from 'src/database/enums';

export const categorySelector = [
  `${Table.CATEGORIES}.category_id`,
  'level',
  'slug',
  'category',
  'parent_id',
  'id_path',
];
