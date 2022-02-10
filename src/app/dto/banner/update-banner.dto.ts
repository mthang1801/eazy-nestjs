import { IsOptional, IsNotEmpty } from 'class-validator';
export class UpdateBannerDTO {
  @IsOptional()
  url: string;
  @IsOptional()
  banner: string;
  @IsOptional()
  description: string;
  @IsOptional()
  position: number;
  @IsOptional()
  status: string;
  @IsOptional()
  type: string;
}
