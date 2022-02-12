import { IProductFeature } from './productFeature.interface';
import { IProductFeatureDescription } from './productFeatureDescriptions.interface';
import { IProductFeatureVariantsResponse } from './productFeatureVariantsResponse.interface';

export interface IProductFeaturesResponse
  extends IProductFeature,
    IProductFeatureDescription {
  feature_variants?: IProductFeatureVariantsResponse[];
}
