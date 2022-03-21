import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
export class AlterUserCartDto {
  @IsNotEmpty()
  alter_user_id: string;
}
