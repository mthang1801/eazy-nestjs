export const sqlFindRelevantProductsInSameCategory = (
  categories,
  minPrice,
  maxPrice,
) => {
  let select = `SELECT *`;
  let join = `FROM ddv_products_categories INNER JOIN ddv_categories ON ddv_categories.category_id = ddv_products_categories.category_id INNER JOIN ddv_products ON ddv_products.product_id = ddv_products_categories.product_id INNER JOIN ddv_product_prices ON ddv_product_prices.product_id = ddv_products.product_id INNER JOIN ddv_product_descriptions ON ddv_product_descriptions.product_id = ddv_products.product_id `;
  let where = '';
  for (let [i, categoryItem] of categories.entries()) {
    if (i === 0) {
      where += `WHERE ddv_products_categories.category_id = ${categoryItem} AND ddv_product_prices.price BETWEEN ${minPrice} AND ${maxPrice} `;
      continue;
    }
    where += ` OR ddv_products_categories.category_id = ${categoryItem} AND ddv_product_prices.price BETWEEN ${minPrice} AND ${maxPrice} `;
  }
  let limit = `LIMIT 10`;
  let offset = `OFFSET 0`;

  let sql = `${select} ${join} ${where} ${limit} ${offset}`;
  return sql;
};
