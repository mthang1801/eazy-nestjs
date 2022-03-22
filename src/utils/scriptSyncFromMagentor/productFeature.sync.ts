export const sqlGetFeatureValues =
  'SELECT * FROM `ddv_eav_attribute` AS ea JOIN `ddv_eav_attribute_option` AS eao ON ea.attribute_id = eao.attribute_id JOIN `ddv_eav_attribute_option_value` AS eaov ON eao.option_id = eaov.option_id';

export const covertProductFeaturesFromMagento = (magentoData) => {
  const mappingData = new Map([
    ['entity_type_id', 'feature_type'],
    ['attribute_code', 'feature_code'],
    ['frontend_label', 'description'],
    ['frontend_input', 'is_singly_choosen'],
    ['option_id', 'variant_code'],
    ['value', 'variant'],
  ]);
  let cmsData = {};
  for (let [magento, cms] of mappingData) {
    if (magento === 'frontend_input') {
      cmsData[cms] = magentoData[magento] === 'select' ? 'Y' : 'N';
      continue;
    }
    cmsData[cms] = magentoData[magento];
  }
  return cmsData;
};
