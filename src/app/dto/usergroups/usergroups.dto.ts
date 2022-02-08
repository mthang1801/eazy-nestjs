import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserGroupsDto {
  @IsOptional()
  status: string = 'A';

  @IsOptional()
  type: string;

  @IsOptional()
  company_id: number = 0;

  @IsOptional()
  usergroup: string = '';

  @IsOptional()
  lang_code: string = 'vn';
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
