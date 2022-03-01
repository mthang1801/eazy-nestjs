import { customer_type } from 'src/database/constant/customer';
import { Table } from 'src/database/enums';
import { Equal, Like, Not } from 'src/database/find-options/operators';

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

export const userSearchByNameEmailPhone = (val, filterCondition) => {
  if (Object.entries(filterCondition).length) {
    return [
      { [`${Table.USERS}.lastname`]: Like(val), ...filterCondition },
      { [`${Table.USERS}.firstname`]: Like(val), ...filterCondition },
      { [`${Table.USERS}.email`]: Like(val), ...filterCondition },
      { [`${Table.USERS}.phone`]: Like(val), ...filterCondition },
    ];
  }

  return [
    { [`${Table.USERS}.lastname`]: Like(val) },
    { [`${Table.USERS}.firstname`]: Like(val) },
    { [`${Table.USERS}.email`]: Like(val) },
    { [`${Table.USERS}.phone`]: Like(val) },
  ];
};

export const userGroupSearchByNameCode = (
  search = '',
  filterCondition = {},
) => {
  if (!search && !Object.entries(filterCondition).length)
    return filterCondition;
  if (!search && Object.entries(filterCondition).length) {
    return filterCondition;
  }
  if (search && !Object.entries(filterCondition).length) {
    return [
      { [`${Table.USER_GROUP_DESCRIPTIONS}.usergroup`]: Like(search) },
      { [`${Table.USER_GROUPS}.code`]: Like(search) },
    ];
  }
  return [
    {
      ...filterCondition,
      [`${Table.USER_GROUP_DESCRIPTIONS}.usergroup`]: Like(search),
    },
    { ...filterCondition, [`${Table.USER_GROUPS}.code`]: Like(search) },
  ];
};

export const productsListsSearchFilter = (
  search = '',
  filterCondition = {},
) => {
  if (!search && !Object.entries(filterCondition).length)
    return filterCondition;
  if (!search && Object.entries(filterCondition).length) {
    return filterCondition;
  }
  if (search && Object.entries(filterCondition).length) {
    return [
      { [`${Table.PRODUCTS}.product_code`]: Like(search) },
      { [`${Table.PRODUCTS}.barcode`]: Like(search) },
      { [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search) },
    ];
  }
  return [
    {
      ...filterCondition,
      [`${Table.PRODUCTS}.product_code`]: Like(search),
    },
    { ...filterCondition, [`${Table.PRODUCTS}.barcode`]: Like(search) },
    { ...filterCondition, [`${Table.PRODUCTS}.barcode`]: Like(search) },
  ];
};

export const customersListSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  // let splitSearch = search.replace(/\s{2,}/, ' ').split(' ');
  // let firstname: string = search;
  // let lastname: string = search;
  // if (splitSearch.length > 1) {
  //   firstname = splitSearch.slice(0, -1);
  //   lastname = splitSearch.slice(-1);
  // }
  const arraySearch = [
    { [`${Table.USERS}.email`]: Like(search) },
    { [`${Table.USERS}.phone`]: Like(search) },
    { [`${Table.USERS}.firstname`]: Like(search) },
    { [`${Table.USERS}.lastname`]: Like(search) },
  ];
  filterConditions = {
    ...filterConditions,
    [`${Table.USERS}.user_type`]: customer_type.map((type) => type),
  };
  console.log(arraySearch);
  return searchFilterTemplate(search, filterConditions, arraySearch);
};

const searchFilterTemplate = (
  search = '',
  filterConditions = {},
  fieldsSearch = [],
) => {
  if (!search && !Object.entries(filterConditions).length)
    return filterConditions;
  if (!search && Object.entries(filterConditions).length) {
    return filterConditions;
  }
  if (search && !Object.entries(filterConditions).length) {
    return [fieldsSearch.map((searchItem) => ({ ...searchItem }))];
  }

  return fieldsSearch.map((searchItem) => ({
    ...filterConditions,
    ...searchItem,
  }));
};
