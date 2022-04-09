import { Table } from '../../enums/tables.enum';
import { JoinTable } from '../../enums/joinTable.enum';

export const productJoinCategory = {
  [JoinTable.leftJoin]: {
    [Table.CATEGORY_DESCRIPTIONS]: {
      fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
      rootJoin: `${Table.CATEGORIES}.category_id`,
    },
  },
};
