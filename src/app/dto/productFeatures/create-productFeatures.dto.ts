import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductFeatureDto {
  @IsNotEmpty({ message: 'Tên thuộc tính là bắt buộc.' })
  feature_name: string;

  @IsNotEmpty({ message: 'Giá trị thuộc tính là bắt buộc.' })
  feature_values: string[];

  @IsOptional()
  display_status: boolean = true;
}
