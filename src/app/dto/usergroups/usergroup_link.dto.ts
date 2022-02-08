import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserGroupLinkDto {
  @IsNotEmpty({ message: 'user_id là bắt buộc.' })
  user_id: number;

  @IsNotEmpty({ message: 'usergroup_id là bắt buộc.' })
  usergroup_id: number;

  @IsOptional()
  status: string;
}

export class UpdateUserGroupLinkDto {
  @IsOptional()
  usergroup_id: number;

  @IsOptional()
  status: string;
}
