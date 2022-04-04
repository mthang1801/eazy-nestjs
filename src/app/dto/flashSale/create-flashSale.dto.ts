import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { convertToMySQLDateTime } from '../../../utils/helper';
export class CreateFlashSaleDto {
  @IsNotEmpty()
  name: string = '';

  @IsOptional()
  code: string = '';

  @IsOptional()
  url: string = '';

  @IsOptional()
  description: string = '';

  @IsOptional()
  flash_type: number = 0;

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  start_at: string;

  @IsOptional()
  end_at: string;

  @IsOptional()
  show_countdown: string = 'N';

  @IsOptional()
  logo_img: string;

  @IsOptional()
  background_img: string;

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => FlashSaleDetails)
  flash_sale_details: FlashSaleDetails[];
}

class FlashSaleDetails {
  @IsNotEmpty()
  tab_name: string;

  @IsOptional()
  detail_url: string;

  @ValidateNested()
  @ArrayNotEmpty()
  @Type(() => FlashSaleProducts)
  flash_sale_products: FlashSaleProducts[];
}

class FlashSaleProducts {
  @IsNotEmpty()
  product_id: number;

  @IsOptional()
  flash_sale_product_status: string = 'A';

  @IsNotEmpty()
  position: number;
}
