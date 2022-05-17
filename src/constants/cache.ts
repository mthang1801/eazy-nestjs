export const cacheKeys = {
  catalog: (queryParameters = '') => `catalog${queryParameters}`,
  categoryFE: `category_fe`,
  bannerFE: (subString) => `banner-fe${subString}`,
  productByCategorySlug: (categorySlug) => `cat-${categorySlug}`,
  flashSaleFE: `flash-sale-fe`,
};
