import { IsString, IsOptional } from 'class-validator';
export class UpdateTestDto{
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
}