export const sqlGetCatalogCategoryName =
  'SELECT DISTINCT(a.entity_id), a.*,b.value FROM ddv_catalog_category_entity  AS a INNER JOIN ddv_catalog_category_entity_varchar AS b ON a.entity_id = b.entity_id WHERE a.level > 1 AND attribute_id = 45';
export const sqlGetCatalogCategoryUrlKey =
  'SELECT DISTINCT(a.entity_id), a.*,b.value FROM ddv_catalog_category_entity  AS a INNER JOIN ddv_catalog_category_entity_varchar AS b ON a.entity_id = b.entity_id WHERE a.level > 1 AND attribute_id = 117';
export const sqlGetCatalogCategoryUrlPath =
  'SELECT DISTINCT(a.entity_id), a.*,b.value FROM ddv_catalog_category_entity  AS a INNER JOIN ddv_catalog_category_entity_varchar AS b ON a.entity_id = b.entity_id WHERE a.level > 1 AND attribute_id = 118';

// Script import catalog category from magento
/*
const res = await this.databaseService.executeMagentoPool(
  sqlGetCatalogCategoryName,
);
await this.catalogCategoryRepo.writeExec(
  `TRUNCATE TABLE ${Table.CATALOG_CATEGORIES}`,
);
const catalogCategoriesList = res[0];
for (let categoryItem of catalogCategoriesList) {
  const categoryItemData = {
    ...new CatalogCategoryEntity(),
    ...this.catalogCategoryRepo.setData(categoryItem),
    name: categoryItem['value'],
  };
  await this.catalogCategoryRepo.create(categoryItemData, false);
}

const resUrlKey = await this.databaseService.executeMagentoPool(
  sqlGetCatalogCategoryUrlKey,
);

const catalogCategoriesKeyList = resUrlKey[0];
for (let categoryItem of catalogCategoriesKeyList) {
  await this.catalogCategoryRepo.update(
    { entity_id: categoryItem.entity_id },
    { url_key: categoryItem.value },
  );
}

const resUrlPath = await this.databaseService.executeMagentoPool(
  sqlGetCatalogCategoryUrlPath,
);

const catalogCategoriesPathList = resUrlPath[0];
for (let categoryItem of catalogCategoriesPathList) {
  await this.catalogCategoryRepo.update(
    { entity_id: categoryItem.entity_id },
    { url_path: categoryItem.value },
  );
}
*/
