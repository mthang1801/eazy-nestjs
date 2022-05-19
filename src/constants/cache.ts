export const cacheKeys = {
  catalog: (queryParameters = '') => `catalog${queryParameters}`,
  categories: `categories`,
  banner: (bannerId) => `banner-${bannerId}`,
  productByCategorySlug: (categorySlug) => `cat-${categorySlug}`,
  flashSaleFE: `flash-sale-fe`,
  category: (categoryId) => `cat-${categoryId}`,
  product: (productId) => `product-${productId}`,
};

export const cacheTables = {
  category: 'Category',
  product: 'Product',
  productFeature: 'Product Feature',
  sticker: 'Sticker',
  banner: 'Banner',
};

export const cacheModules = {
  categoryList: 'Category List',
  categoryId: 'Category Id',
  banner: 'Banner',
  bannerId: 'Banner Id',
  productId: 'Product Id',
};
