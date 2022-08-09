import { ApiProperty } from '@nestjs/swagger';

export class UploadEntity {
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: [
      'files/test/2022/08/09/file_1.png',
      'files/test/2022/08/09/file_2.png',
    ],
  })
  files: string[];

  object: string = 'default';

  object_id: number = 1;

  object_type: string = '';
}

export class UploadEntityResponseEntity {
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: [
      'files/test/2022/08/09/file_1.png',
      'files/test/2022/08/09/file_2.png',
    ],
  })
  data: string[];
}

export class GetFileEntity {
  @ApiProperty({ type: String, example: 'files/test/2022/08/09/file_1.png' })
  data: string;
}
