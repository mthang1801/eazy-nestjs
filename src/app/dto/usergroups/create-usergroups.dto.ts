import { IsOptional } from 'class-validator';

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
  lang_code: string = 'vi';
}
