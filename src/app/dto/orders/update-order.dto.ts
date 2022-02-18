import { IsOptional, IsNotEmpty, MaxLength,ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';class Product{
    @IsNotEmpty()
    product_id: number;

    @IsNotEmpty()
    amount: number;
    @IsOptional()
    extra: string;
}
export class OrderUpdateDTO {


    @IsOptional()
    is_parent_order: string;
    @IsOptional()
    parent_order_id: number;
    @IsOptional()
    company_id: number;
    @IsOptional()
    subtotal_discount: number;
    @IsOptional()
    payment_surcharge: number;
    @IsOptional()
    shipping_ids: string;
    @IsOptional()
    shipping_cost: number;
    @IsOptional()
    status: string;
    @IsOptional()
    notes: string;
    @IsOptional()
    details: string;
    @IsOptional()
    promotions: string;
    @IsOptional()
    promotion_ids: string;
    @IsOptional()
    firstname: string;
    @IsOptional()
    lastname: string;
    @IsOptional()
    company: string;
    @IsOptional()
    s_firstname: string;
    @IsOptional()
    s_lastname: string;
    @IsOptional()
    s_address: string;
    @IsOptional()
    s_address_2: string;
    @IsOptional()
    s_city: string;
    @IsOptional()
    s_county: string;
    @IsOptional()
    s_state: string;
    @IsOptional()
    s_country: string;
    @IsOptional()
    s_zipcode: string;
    @IsOptional()
    s_phone: string;
    @IsOptional()
    s_address_type: string;
    @IsOptional()
    phone: string;
    @IsOptional()
    fax: string;
    @IsOptional()
    url: string;
    @IsOptional()
    email: string;
    @IsOptional()
    payment_id: number;
    @IsOptional()
    tax_exempt: string;
    @IsOptional()
    lang_code: string;
    @IsOptional()
    ip_address: string;
    @IsOptional()
    repaid: number;
    @IsOptional()
    validation_code: string;
    @IsOptional()
    localization_id: number;
    @IsOptional()
    utm_source: number;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Product)
    products: Product[]=[];
   
}


