import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateCatalogCategoryItemDto{
    @IsNotEmpty()
    @IsNumber()
    catalog_id: number;

    @IsOptional()
    @IsString()
    filter_code: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    status: string;

    @IsOptional()
    position: number;
}