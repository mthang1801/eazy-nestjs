import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserGroupDescriptionDto {
  @IsNotEmpty({ message: 'usergroup_id là bắt buộc' })
  usergroup_id: number;

  @IsNotEmpty({ message: 'usergroup là bắt buộc' })
  usergroup: string;

  @IsNotEmpty({ message: 'lang_code là bắt buộc' })
  lang_code: string;
}

export class UpdateUserGroupDescriptionDto {
  @IsNotEmpty({ message: 'usergroup_id là bắt buộc' })
  usergroup_id: number;

  @IsNotEmpty({ message: 'usergroup là bắt buộc' })
  usergroup: string;

  @IsNotEmpty({ message: 'lang_code là bắt buộc' })
  lang_code: string;
}
