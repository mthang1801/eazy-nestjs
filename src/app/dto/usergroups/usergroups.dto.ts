import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
