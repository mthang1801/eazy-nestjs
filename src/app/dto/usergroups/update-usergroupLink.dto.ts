import { IsOptional } from 'class-validator';

export class UpdateUserGroupLinkDto {
  @IsOptional()
  usergroup_id: number;

  @IsOptional()
  status: string;
}
