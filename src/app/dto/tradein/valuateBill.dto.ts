import { ArrayNotEmpty, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ValuateBillDto {
  @IsNotEmpty()
  product_id: number;

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => CriteriaSelection)
  applied_criteria_set: CriteriaSelection[];
}

class CriteriaSelection {
  @IsNotEmpty()
  criteria_id: number;

  @IsNotEmpty()
  criteria_detail_id: number;
}
