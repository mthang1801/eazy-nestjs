import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserGroupsDto {
  @IsNotEmpty({ message: 'usergroup_id là bắt buộc' })
  usergroup_id: number;

  @IsOptional()
  status: string;

  @IsOptional()
  type: string;

  @IsOptional()
  company_id: number;
}

export class UpdateUserGroupDescriptionDto {
  @IsNotEmpty({ message: 'usergroup_id là bắt buộc' })
  usergroup_id: number;

  @IsNotEmpty({ message: 'usergroup là bắt buộc' })
  usergroup: string;

  @IsNotEmpty({ message: 'lang_code là bắt buộc' })
  lang_code: string;
}

export class UpdateUserGroupLinkDto {
  @IsNotEmpty({ message: 'user_id là bắt buộc.' })
  user_id: number;

  @IsNotEmpty({ message: 'usergroup_id là bắt buộc.' })
  usergroup_id: number;

  @IsOptional()
  status: string;
}

export class UpdateUserGroupPrivilegeDto {
  @IsNotEmpty({ message: 'privilege_id là bắt buộc' })
  privilege_id: number;

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
