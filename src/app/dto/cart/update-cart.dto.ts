import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
export class UpdateCartDto {
  @IsNotEmpty()
  alter_user_id: string;
}
