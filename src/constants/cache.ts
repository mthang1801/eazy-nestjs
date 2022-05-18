export const cacheKeys = {
  catalog: (queryParameters = '') => `catalog${queryParameters}`,
  categoryFE: `category_fe`,
  bannerFE: (subString) => `banner-fe${subString}`,
  productByCategorySlug: (categorySlug) => `cat-${categorySlug}`,
  flashSaleFE: `flash-sale-fe`,
  category: (categoryId) => `cat-${categoryId}`,
};

export const cacheTables = {
  category: 'Category',
};

export const cacheModules = {
  categoryList: 'Category List',
  categorySlug: 'Category Slug',
};
