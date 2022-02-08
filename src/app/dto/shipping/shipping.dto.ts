import { IsOptional, IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';
export class shippingCreateDTO {
    @IsOptional()
    company_id: number;
    @IsOptional()
    @MaxLength(1)
    destination : string;
    @IsOptional()
    min_weight: number;
    @IsOptional()
    max_weight: number;
    @IsOptional()
    usergroup_ids: string;
    @IsOptional()
    @MaxLength(1)
    rate_calculation :string;
    @IsOptional()
    service_id: number;
    @IsOptional()
    service_params: string;
    @IsOptional()
    localization : string;
    @IsOptional()
    tax_ids: string;
    @IsOptional()
    position: number;
    @IsOptional()
    @MaxLength(1)
    status: string;
    @IsOptional()
    @MaxLength(1)
    free_shipping: string;
    @IsOptional()
    @MaxLength(1)
    is_address_required: string;
    @IsOptional()
    @MaxLength(2)
    lang_code: string;
    @IsOptional()
    shipping: string;
    @IsOptional()
    delivery_time:string;
    @IsOptional()
    description: string;

    @IsOptional()
    statusService: string;
    @IsOptional()
    descriptionService: string;
}
