import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { genRandomString } from 'src/utils/helper';

import { generateRandomString } from '../../utils/functions.utils';

export class UploadFileDto {
  @IsOptional()
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
    description: 'Files',
  })
  files: any[];

  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Object Name. Example: product',
    required: false,
  })
  object: string = 'default';

  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    description: 'id of Object',
    default: generateRandomString(),
  })
  object_id: string = generateRandomString();

  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'type of object',
    required: false,
  })
  object_type: string;
}
