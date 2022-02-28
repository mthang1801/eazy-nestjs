import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserGroupPrivilegeDto {
  @IsNotEmpty()
  privilege_id: number = 0;

  @IsNotEmpty()
  usergroup_id: number = 0;
}
