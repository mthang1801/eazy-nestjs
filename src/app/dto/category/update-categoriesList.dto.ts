import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
export class UpDateCategoriesListDto {
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => CategoryItem)
  categories: CategoryItem[];
}

class CategoryItem {
  @IsNotEmpty()
  category_id: number;

  @IsOptional()
  position: number;
}
