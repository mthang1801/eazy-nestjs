import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export class UpdateUserRoleDto{
    @IsOptional()
    partner_id: number;
    
    @IsNotEmpty()
    @IsNumber()
    user_id: number;

    @IsNotEmpty()
    @IsNumber()
    role_id: number;

    @IsNotEmpty()
    status: string;

    @IsOptional()
    createdAt: string;

    @IsOptional()
    createdBy: string;

    @IsOptional()
    updatedAt: string;

    @IsOptional()
    updatedBy: string;
}