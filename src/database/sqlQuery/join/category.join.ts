import { JoinTable } from '../../enums/joinTable.enum';
import { Table } from '../../enums/tables.enum';
export const categoryJoiner = {
  [JoinTable.leftJoin]: {
    [Table.CATEGORY_DESCRIPTIONS]: {
      fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
      rootJoin: `${Table.CATEGORIES}.category_id`,
    },
  },
};

export const categoryJoinProduct = {
  [JoinTable.leftJoin]: {
    [Table.CATEGORY_DESCRIPTIONS]: {
      fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
      rootJoin: `${Table.CATEGORIES}.category_id`,
    },
    [Table.PRODUCTS_CATEGORIES]: {
      fieldJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
      rootJoin: `${Table.CATEGORIES}.category_id`,
    },
  },
};
