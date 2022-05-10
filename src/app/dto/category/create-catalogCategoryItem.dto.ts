import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCatalogCategoryItemDto{
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