import { ApiProperty } from '@nestjs/swagger';
import { formatStandardTimeStamp } from '../utils/functions.utils';

export class ExampleEntity {
  @ApiProperty({ type: Number, example: 1 })
  example_id: number = 0;

  @ApiProperty({ type: String, example: 'John Doe' })
  fullname: string;

  @ApiProperty({ type: [String], example: ['Johnny', 'Donny'] })
  other_names: string[];

  @ApiProperty({ type: String, example: 'johndoe@email.com' })
  email: string = '';

  @ApiProperty({ type: String, enum: [true, false], default: true })
  isSubscribeEmail: string = 'true';

  @ApiProperty({ type: String, example: '0123456789' })
  phone: string = '';

  @ApiProperty({ type: Number, example: 255 })
  province_id: number = null;

  @ApiProperty({ type: Number, example: 755 })
  district_id: number = null;

  @ApiProperty({ type: Number, example: 8790 })
  ward_id: number = null;

  @ApiProperty({ type: String, example: '123 Quang Trung str' })
  address: string = '';

  @ApiProperty({
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    example: [
      [110.7294, 10.8372489],
      [111.47382947, 10.4732984],
    ],
  })
  shop_coords: string = '';

  @ApiProperty({ type: String, maxLength: 256, default: 'default-avatar.svg' })
  avatar: string = '';

  @ApiProperty({
    type: String,
    format: 'YYYY-MM-DD HH:mm:ss',
    example: '2022-08-09 21:51:30',
  })
  created_at: string = formatStandardTimeStamp();

  @ApiProperty({
    type: String,
    format: 'YYYY-MM-DD HH:mm:ss',
    example: '2022-08-09 21:51:30',
  })
  updated_at: string = formatStandardTimeStamp();
}
