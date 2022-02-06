import {
  IsEmail,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateUserGroupsDto {
  @IsOptional()
  status: string;

  @IsOptional()
  type: string;

  @IsOptional()
  company_id: number;

  @IsOptional()
  description: string;

  @IsOptional()
  lang_code: string;
}

export class CreateUserGroupDescriptionDto {
  @IsNotEmpty({ message: 'usergroup_id là bắt buộc' })
  usergroup_id: number;

  @IsNotEmpty({ message: 'usergroup là bắt buộc' })
  usergroup: string;

  @IsNotEmpty({ message: 'lang_code là bắt buộc' })
  lang_code: string;
}

export class CreateUserGroupLinkDto {
  @IsNotEmpty({ message: 'user_id là bắt buộc.' })
  user_id: number;

  @IsNotEmpty({ message: 'usergroup_id là bắt buộc.' })
  usergroup_id: number;

  @IsOptional()
  status: string;
}

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
