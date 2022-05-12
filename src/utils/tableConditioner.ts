import { customer_type } from 'src/constants/customer';
import { Table } from 'src/database/enums';
import { UserTypeEnum } from 'src/database/enums/tableFieldEnum/user.enum';
import { Equal, Like, Not } from 'src/database/operators/operators';
import { convertToSlug } from './helper';

const searchFilterTemplate = (filterConditions = {}, fieldsSearch = []) => {
  if (!fieldsSearch.length && !Object.entries(filterConditions).length)
    return filterConditions;
  if (!fieldsSearch.length && Object.entries(filterConditions).length) {
    return filterConditions;
  }
  if (fieldsSearch.length && !Object.entries(filterConditions).length) {
    return fieldsSearch.map((searchItem) => ({ ...searchItem }));
  }
  let result = [];

  for (let fieldSearchItem of fieldsSearch) {
    result = [
      ...result,
      {
        ...filterConditions,
        ...fieldSearchItem,
      },
    ];
  }

  return result;
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
      { [`${Table.USERS}.email`]: Like(search) },
      { [`${Table.USERS}.phone`]: Like(search) },
    ];
    if (firstName) {
      arraySearch = [
        ...arraySearch,
        { [`${Table.USERS}.firstname`]: Like(firstName) },
        { [`${Table.USERS}.lastname`]: Like(firstName) },
      ];
    }
    if (lastName) {
      arraySearch = [
        ...arraySearch,
        { [`${Table.USERS}.lastname`]: Like(lastName) },
        { [`${Table.USERS}.firstname`]: Like(lastName) },
      ];
    }
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

  return filterCondition;
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
    arraySearch = [{ [`${Table.USERS}.phone`]: Like(search) }];
    if (firstName) {
      arraySearch = [
        ...arraySearch,
        { [`${Table.USER_PROFILES}.b_firstname`]: Like(firstName) },
        { [`${Table.USER_PROFILES}.b_lastname`]: Like(firstName) },
      ];
    }
    if (lastName) {
      arraySearch = [
        ...arraySearch,
        { [`${Table.USER_PROFILES}.b_lastname`]: Like(lastName) },
        { [`${Table.USER_PROFILES}.b_firstname`]: Like(lastName) },
      ];
    }
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
      { [`${Table.BANNER}.banner`]: Like(search) },
      {
        [`${Table.BANNER_LOCATION_DESCRIPTION}.location_description`]:
          Like(search),
      },
      {
        [`${Table.BANNER_TARGET_DESCRIPTION}.target_description`]: Like(search),
      },
    ];
  }
  return searchFilterTemplate(filterConditions, arraySearch);
};

export const productFeatureSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.PRODUCT_FEATURE_DESCRIPTIONS}.description`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const productFeatureVariantSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      {
        [`${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant`]:
          Like(search),
      },
    ];
  }
  return searchFilterTemplate(filterConditions, arraySearch);
};

export const productSearch = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search) },
      {
        [`${Table.PRODUCTS}.slug`]: Like(convertToSlug(search)),
      },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const categorySearch = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.CATEGORY_DESCRIPTIONS}.category`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const categoriesSearchFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.CATEGORY_DESCRIPTIONS}.category`]: Like(search) },
      { [`${Table.CATEGORY_DESCRIPTIONS}.category_appcore`]: Like(search) },
    ];
  }
  return searchFilterTemplate(filterConditions, arraySearch);
};

export const productSearchFilterOnOrder = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search) },
      { [`${Table.PRODUCTS}.product_code`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const storeLocationSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.STORE_LOCATION_DESCRIPTIONS}.store_name`]: Like(search) },
      { [`${Table.STORE_LOCATION_DESCRIPTIONS}.short_name`]: Like(search) },
      {
        [`${Table.STORE_LOCATION_DESCRIPTIONS}.store_location_id`]:
          Like(search),
      },
      {
        [`${Table.STORE_LOCATION_DESCRIPTIONS}.pickup_phone`]: Like(search),
      },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const stickerFilterSearch = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.STICKER}.sticker_name`]: Like(search) },
      { [`${Table.STICKER}.sticker_code`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const promotionAccessoriesSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.PROMOTION_ACCESSORY}.accessory_name`]: Like(search) },
      { [`${Table.PROMOTION_ACCESSORY}.accessory_code`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const getProductsListByCategoryIdSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];
  // if (search) {
  //   arraySearch = [
  //     { [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search) },
  //     { [`${Table.PRODUCTS}.product_code`]: Like(search) },
  //   ];
  // }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const flashSaleSearchFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.FLASH_SALES}.name`]: Like(search) },
      { [`${Table.FLASH_SALES}.code`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const getProductsListByAccessoryIdSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];
  if (search) {
    arraySearch = [
      { [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search) },
      { [`${Table.PRODUCTS}.product_code`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const reviewCommentItemsSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [{ [`${Table.REVIEW_COMMENT_ITEMS}.comment`]: Like(search) }];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const tradeinProgramSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [
      { [`${Table.TRADEIN_PROGRAM}.name`]: Like(search) },
      { [`${Table.TRADEIN_PROGRAM}.desc`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const tradeinProgramDetailSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [{ [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search) }];
    arraySearch = [{ [`${Table.PRODUCTS}.product_code`]: Like(search) }];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const accessoryCategorySearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [{ [`${Table.PRODUCT_DESCRIPTION}.name`]: Like(search) }];
    arraySearch = [{ [`${Table.PRODUCTS}.code`]: Like(search) }];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const logSearchFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [{ [`${Table.LOG}.ref_id`]: Like(search) }];
    arraySearch = [{ [`${Table.LOG}.error_detail`]: Like(search) }];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const tradeinOldReceiptSearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [
      { [`${Table.TRADEIN_OLD_RECEIPT}.code`]: Like(search) },
      { [`${Table.TRADEIN_OLD_RECEIPT}.description`]: Like(search) },
      { [`${Table.TRADEIN_OLD_RECEIPT_DETAIL}.product_code`]: Like(search) },
      { [`${Table.TRADEIN_OLD_RECEIPT_DETAIL}.barcode`]: Like(search) },
      { [`${Table.TRADEIN_OLD_RECEIPT_DETAIL}.product`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};

export const groupListSearchFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [{ [`${Table.ROLE}.role_name`]: Like(search) }];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};
