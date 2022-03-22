import { convertToMySQLDateTime } from 'src/utils/helper';
export const sqlSyncGetCategoryFromMagento =
  'SELECT * FROM  `ddv_catalog_category_entity` cce  JOIN `ddv_catalog_category_entity_varchar` ccev ON cce.entity_id = ccev.entity_id;';

export const convertCategoryFromMagentoToCMS = (magentoData) => {
  const mappingData = new Map([
    ['parent_id', 'parent_magento_id'],
    ['path', 'id_magento_path'],
    ['entity_id', 'category_magento_id'],
    ['position', 'position'],
    ['level', 'level'],
    ['children_count', 'product_count'],
    ['value', 'category'],
    ['attribute_id', 'feature_id'],
    ['created_at', 'created_at'],
    ['updated_at', 'updated_at'],
  ]);

  let cmsData = {};
  for (let [magento, cms] of mappingData) {
    if (magento === 'created_at' || magento === 'updated_at') {
      cmsData[cms] = convertToMySQLDateTime(new Date(magentoData[magento]));
      continue;
    }
    if (magento === 'value' && magentoData[magento] == null) {
      cmsData[cms] = '';
      continue;
    }
    cmsData[cms] = magentoData[magento];
  }

  return cmsData;
};
