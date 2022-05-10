import { IsString, IsOptional } from 'class-validator';
export class CreateTestDto{
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
}