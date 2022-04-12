import { JoinTable } from '../../enums/joinTable.enum';
import { Table } from '../../enums/tables.enum';
export const productVariantJoiner = {
  [JoinTable.innerJoin]: {
    [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
      fieldJoin: 'variant_id',
      rootJoin: 'variant_id',
    },
  },
};
