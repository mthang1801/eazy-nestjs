import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { formatStandardTimeStamp } from 'src/utils/helper';
export class UpdateShippingDto {
  @IsNotEmpty()
  @IsString()
  shipping_name: string;

  @IsOptional()
  shipping_description: string;

  @IsOptional()
  status: string = 'A';

  @Type(() => ShippingService)
  @ValidateNested()
  @ArrayNotEmpty()
  services: ShippingService[];

  @IsOptional()
  created_at: string = formatStandardTimeStamp();

  @IsNotEmpty()
  image_path: string;
}

class ShippingService {
  @IsOptional()
  service_id: string;

  @IsNotEmpty()
  service_name: string;

  @IsOptional()
  service_code: string;

  @IsOptional()
  service_description: string;

  @IsOptional()
  status: string = 'A';
}
