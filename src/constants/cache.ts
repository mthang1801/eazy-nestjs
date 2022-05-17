export const cacheKeys = {
  catalog: (queryParameters = '') => `catalog${queryParameters}`,
  categoryFE: `category_fe`,
  bannerFE: (subString) => `banner_fe${subString}`,
  productByCategorySlug: (categorySlug) => `cat_${categorySlug}`,
};
