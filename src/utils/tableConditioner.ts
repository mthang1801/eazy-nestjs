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
  filterConditions = {},
) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.PRODUCTS}.product_code`]: Like(search) },
      { [`${Table.PRODUCTS}.barcode`]: Like(search) },
      { [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const customersListSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let splitSearchArr = search.replace(/\s{2,}/, ' ').split(' ');
  let firstName = splitSearchArr.slice(0, -1).join(' ').trim();
  let lastName = splitSearchArr.slice(-1)[0].trim();
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.USERS}.email`]: Like(search) },
      { [`${Table.USERS}.phone`]: Like(search) },
      { [`${Table.USERS}.firstname`]: Like(firstName) },
      { [`${Table.USERS}.lastname`]: Like(lastName) },
    ];
  }

  filterConditions = {
    ...filterConditions,
    [`${Table.USERS}.user_type`]: customer_type.map((type) => type),
  };

  return searchFilterTemplate(filterConditions, arraySearch);
};

const searchFilterTemplate = (filterConditions = {}, fieldsSearch = []) => {
  if (!fieldsSearch.length && !Object.entries(filterConditions).length)
    return filterConditions;
  if (!fieldsSearch.length && Object.entries(filterConditions).length) {
    return filterConditions;
  }
  if (fieldsSearch.length && !Object.entries(filterConditions).length) {
    return fieldsSearch.map((searchItem) => ({ ...searchItem }));
  }

  return fieldsSearch.map((searchItem) => ({
    ...filterConditions,
    ...searchItem,
  }));
};
