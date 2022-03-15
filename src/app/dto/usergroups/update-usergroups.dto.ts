import { IsOptional } from 'class-validator';

export class UpdateUserGroupsDto {
  @IsOptional()
  usergroup: string;

  @IsOptional()
  status: string;

  @IsOptional()
  privileges: number[];
}
