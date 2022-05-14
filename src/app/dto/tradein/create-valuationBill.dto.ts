import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateValuationBillDto{
    @IsNotEmpty()
    @IsString()
    customer_phone: string;

    @IsNotEmpty()
    @IsString()
    customer_name: string;

    @IsOptional()
    @IsNumber()
    collect_price: number;

    @IsOptional()
    @IsNumber()
    criteria_price: number;
    
    @IsOptional()
    @IsNumber()
    estimate_price: number;

    @IsOptional()
    @IsNumber()
    final_price: number;

    @IsNotEmpty()
    @IsNumber()
    imei: number;

    @IsOptional()
    @IsString()
    note: string;
}