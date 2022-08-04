import { IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  object: string = 'default';

  @IsOptional()
  object_id: number | string = '0';

  @IsOptional()
  object_type: string;
}
