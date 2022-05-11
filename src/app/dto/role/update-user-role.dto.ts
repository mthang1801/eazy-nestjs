import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateGroupDto{
    @IsString()
    @IsNotEmpty()
    role_name: string;

    @IsString()
    @IsOptional()
    status: string;

    @IsNumber()
    @IsNotEmpty()
    funct_id: number;
}