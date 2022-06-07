import { IsNotEmpty, IsOptional } from "class-validator";

export class ProductPreviewDto {
    @IsNotEmpty()
    product_id: number;

    @IsOptional()
    data: string;
}