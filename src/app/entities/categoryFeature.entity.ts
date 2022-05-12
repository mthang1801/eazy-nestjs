import { formatStandardTimeStamp } from '../../utils/helper';
export class CategoryFeatureEntity{
    category_id: number = 0;
    feature_id: number = 0;
    status: 'A';
    position: number = 0;
    created_at: string = formatStandardTimeStamp();
    updated_at: string = formatStandardTimeStamp();
}