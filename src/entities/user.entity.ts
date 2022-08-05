import { ApiProperty } from '@nestjs/swagger';
import { formatStandardTimeStamp } from 'src/utils/helper';

export class UserEntity {
  @ApiProperty({ type: Number })
  user_id: number = 0;
  @ApiProperty({ type: String })
  firstname: string = '';
  @ApiProperty({ type: String })
  lastname: string = '';
  @ApiProperty({ type: String })
  phone: string = '';
  @ApiProperty({ type: Number, enum: [1, 2] })
  status: number = 1;
  @ApiProperty({ type: String })
  email: string = '';
  @ApiProperty({ type: Number, enum: [0, 1] })
  gender: number = 0;
  @ApiProperty({ type: String, format: 'YYYY-MM-DD HH:hh:ss' })
  created_at: string = formatStandardTimeStamp();
  @ApiProperty({ type: String, format: 'YYYY-MM-DD HH:hh:ss' })
  updated_at: string = formatStandardTimeStamp();
}
