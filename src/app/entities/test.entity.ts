import { formatStandardTimeStamp } from '../../utils/helper';
export class TestEntity{
    name: string = '';
    description: string = '';
    created_at: string = formatStandardTimeStamp();
    updated_at: string = formatStandardTimeStamp();
}