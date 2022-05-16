import { ArrayNotEmpty, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ValuateBillDto {
  @IsNotEmpty()
  product_id: number;

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => CriteriaSelection)
  criteria_set: CriteriaSelection[];
}

class CriteriaSelection {
  @IsNotEmpty()
  criteria_id: number;

  @IsNotEmpty()
  criteria_detail_id: number;
}
