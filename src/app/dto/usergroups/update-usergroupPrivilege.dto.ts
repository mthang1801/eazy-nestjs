import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserGroupPrivilegeDto {
  @IsOptional()
  usergroup_id: number;

  @IsOptional()
  privilege: string;

  @IsOptional()
  description: string;

  @IsOptional()
  parent_id: number;

  @IsOptional()
  level: number;

  @IsOptional()
  route: string;

  @IsOptional()
  method: string;

  @IsOptional()
  icon: string;
}
