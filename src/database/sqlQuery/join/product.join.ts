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

export const reviewCommentProductJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.REVIEW_COMMENT_ITEMS}.product_id`,
    },
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.REVIEW_COMMENT_ITEMS}.product_id`,
    },
    [Table.PRODUCTS_CATEGORIES]: {
      fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
      rootJoin: `${Table.REVIEW_COMMENT_ITEMS}.product_id`,
    },
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORIES}.category_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
    },
  },
};
