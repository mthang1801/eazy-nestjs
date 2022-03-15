import { customer_type } from 'src/database/constant/customer';
import { Table } from 'src/database/enums';
import { UserTypeEnum } from 'src/database/enums/tableFieldEnum/user.enum';
import { Equal, Like, Not } from 'src/database/find-options/operators';

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

export const userSystemSearchFilter = (search = '', filterConditions = {}) => {
  let splitSearchArr = search.replace(/\s{2,}/, ' ').split(' ');
  let firstName = splitSearchArr.slice(0, -1).join(' ').trim();
  let lastName = splitSearchArr.slice(-1)[0].trim();
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.USERS}.lastname`]: Like(firstName) },
      { [`${Table.USERS}.firstname`]: Like(lastName) },
      { [`${Table.USERS}.email`]: Like(search) },
      { [`${Table.USERS}.phone`]: Like(search) },
    ];
  }
  filterConditions = {
    ...filterConditions,
    user_type: Not(Equal(UserTypeEnum.Customer)),
  };
  return searchFilterTemplate(filterConditions, arraySearch);
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
    return [{ [`${Table.USER_GROUP_DESCRIPTIONS}.usergroup`]: Like(search) }];
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
      { [`${Table.USERS}.firstname`]: Like(lastName) },
      { [`${Table.USERS}.lastname`]: Like(firstName) },
    ];
  }

  filterConditions = {
    ...filterConditions,
    [`${Table.USERS}.user_type`]: UserTypeEnum.Customer,
  };

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const orderSearchFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [{ [`${Table.ORDERS}.order_code`]: search }];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const searchStatusFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.STATUS_DESCRIPTION}.description`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const paymentFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  return searchFilterTemplate(filterConditions, arraySearch);
};

export const shippingFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.SHIPPINGS_DESCRIPTION}.shipping`]: Like(search) },
      { [`${Table.SHIPPINGS_DESCRIPTION}.delivery_time`]: Like(search) },
      { [`${Table.SHIPPINGS_DESCRIPTION}.description`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const ordersByCustomerFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const bannerSearchFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.BANNER_DESCRIPTIONS}.url`]: Like(search) },
      { [`${Table.BANNER_DESCRIPTIONS}.url_media`]: Like(search) },
      { [`${Table.BANNER_DESCRIPTIONS}.banner_title`]: Like(search) },
      { [`${Table.BANNER_DESCRIPTIONS}.banner`]: Like(search) },
      { [`${Table.BANNER_DESCRIPTIONS}.description`]: Like(search) },
    ];
  }
  return searchFilterTemplate(filterConditions, arraySearch);
};
