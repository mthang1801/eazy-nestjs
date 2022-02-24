import { Table } from 'src/database/enums';
import { Equal, Not } from 'src/database/find-options/operators';

export const productsFamilyFilterConditioner = (product) =>
  product.parent_product_id === 0
    ? {
        [`${Table.PRODUCTS}.parent_product_id`]: product.product_id,
      }
    : [
        {
          [`${Table.PRODUCTS}.parent_product_id`]: product.parent_product_id,
        },
        {
          [`${Table.PRODUCTS}.product_id`]: product.parent_product_id,
        },
      ];

export const productsGroupFilterConditioner = (product) =>
  product.parent_product_id === 0
    ? {
        [`${Table.PRODUCTS}.parent_product_id`]: Not(Equal(product.product_id)),
        [`${Table.PRODUCTS}.product_id`]: Not(Equal(product.product_id)),
        [`${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.group_id`]:
          product.group_id,
      }
    : {
        [`${Table.PRODUCTS}.parent_product_id`]: Not(
          Equal(product.parent_product_id),
        ),
        [`${Table.PRODUCTS}.product_id`]: Not(Equal(product.parent_product_id)),
        [`${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.group_id`]:
          product.group_id,
      };