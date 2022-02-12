import { IProductFeatureVariantDescription } from './productFeatureVariantDescriptions.interface';
import { IProductFeatureVariant } from './productFeatureVariants.interface';

export interface IProductFeatureVariantsResponse
  extends IProductFeatureVariant,
    IProductFeatureVariantDescription {}
