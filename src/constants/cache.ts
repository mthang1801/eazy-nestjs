export const cacheKeys = {
  catalog: (queryParameters = '') =>
    `/be/v1/category/catalog${queryParameters}`,
};
