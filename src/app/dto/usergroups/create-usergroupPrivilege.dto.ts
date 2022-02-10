import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserGroupPrivilegeDto {
  @IsNotEmpty({ message: 'usergroup_id là bắt buộc.' })
  usergroup_id: number;

  @IsNotEmpty({ message: 'privilege là bắt buộc.' })
  privilege: string;

  @IsOptional()
  description: string = '';

  @IsOptional()
  parent_id: number = 0;

  @IsNotEmpty()
  level: number = 1;

  @IsOptional()
  route: string = '';

  @IsOptional()
  method: string = '';

  @IsOptional()
  icon: string = '';
}
