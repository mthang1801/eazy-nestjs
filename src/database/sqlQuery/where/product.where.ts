import { Table } from 'src/database/enums';
import { Like } from 'src/database/operators/operators';
import { searchFilterTemplate } from './template.where';
import { UserTypeEnum } from '../../enums/tableFieldEnum/user.enum';

export const getParentProductsSearchFilter = (
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

export const getProductByIdentifierCondition = (identifier) => [
  { [`${Table.PRODUCTS}.product_id`]: identifier },
  { [`${Table.PRODUCTS}.product_appcore_id`]: identifier },
];

export const getProductBySlugCondition = (slug) => ({
  [`${Table.PRODUCTS}.slug`]: slug,
});

export const productsListCategorySearchFilter = (
  categoriesList,
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
  let searchList = [];
  for (let categoryId of categoriesList) {
    if (arraySearch.length) {
      let categoryWithSearch = [];
      for (let searchItem of arraySearch) {
        categoryWithSearch = [
          ...categoryWithSearch,
          {
            ...searchItem,
            [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoryId,
          },
        ];
      }

      searchList = [...searchList, ...categoryWithSearch];
    } else {
      searchList = [
        ...searchList,
        { [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoryId },
      ];
    }
  }

  if (searchList.length) {
    arraySearch = searchList;
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
    [`${Table.USERS}.user_type`]: UserTypeEnum.Customer,
  };

  return searchFilterTemplate(filterConditions, arraySearch);
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

export const productListsInCategorySearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [
      { [`${Table.PRODUCTS}.product_code`]: Like(search) },
      { [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search) },
    ];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};
