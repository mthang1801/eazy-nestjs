import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserGroupPrivilegeDto {
  @IsNotEmpty({ message: 'usergroup_id là bắt buộc.' })
  usergroup_id: number;

  @IsNotEmpty({ message: 'privilege là bắt buộc.' })
  privilege: string;

  @IsOptional()
  description: string;

  @IsOptional()
  parent_id: number;

  @IsNotEmpty()
  level: number;

  @IsOptional()
  route: string;

  @IsNotEmpty()
  method: string;

  @IsOptional()
  icon: string;
}

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
