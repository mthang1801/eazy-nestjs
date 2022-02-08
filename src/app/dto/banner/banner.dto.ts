import { IsOptional, IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class BannerCreateDTO {
    @IsOptional()
    status: string;
    @IsOptional()
    type: string;
    @IsOptional()
    target: string;
    @IsOptional()
    localization: string;
    @IsOptional()
    position: number;
    @IsNotEmpty()
    image_path: string;
    @IsNotEmpty()
    banner: string;
    @IsOptional()
    description: string;
    @IsOptional()
    url: string;
    @IsOptional()
    image_x: number
    @IsOptional()
    image_y: number
    @IsOptional()
    is_high_res: string
}
export class UpdateBannerDTO {
    @IsOptional()
    url : string;
    @IsOptional()
    banner :string
    @IsOptional()
    description:string
    @IsOptional()
    position: number
    @IsOptional()
    status:string
    @IsOptional()
    type:string
}
export class createBannerImageDTO{
   
    
    @IsOptional()
    position: number;
    @IsNotEmpty()
    image_path: string;
   
    @IsOptional()
    image_x: number
    @IsOptional()
    image_y: number
    @IsOptional()
    is_high_res: string
}
export class updateBannerImageDTO{
   
    
    @IsOptional()
    position: number;
    @IsNotEmpty()
    image_path: string;
   
    @IsOptional()
    image_x: number
    @IsOptional()
    image_y: number
    @IsOptional()
    is_high_res: string
}

