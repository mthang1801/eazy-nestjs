import { IsOptional, MaxLength } from 'class-validator';

export class PaymentUpdateDTO {
  @IsOptional()
  company_id: number;
  @IsOptional()
  usergroup_ids: string;
  @IsOptional()
  position: number;
  @IsOptional()
  @MaxLength(1)
  status: string;
  @IsOptional()
  template: string;
  @IsOptional()
  processor_id: number;
  @IsOptional()
  processor_params: string;
  @IsOptional()
  a_surcharge: number;
  @IsOptional()
  p_surcharge: number;
  @IsOptional()
  tax_ids: string;
  @IsOptional()
  localization: string;
  @IsOptional()
  payment_category: string;
  @IsOptional()
  description: string;
  @IsOptional()
  payment: string;
  @IsOptional()
  instructions: string;
  @IsOptional()
  surcharge_title: string;
  @IsOptional()
  lang_code: string;
}
