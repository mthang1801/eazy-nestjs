import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { defaultPassword } from '../../../constants/defaultPassword';

export class CreateUserSystemDto {
  @IsOptional()
  firstname: string = '';

  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  role_id: number;

  @IsNotEmpty()
  store_id: number;

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  @MaxLength(32, { message: 'Mật khẩu quá dài, vui lòng nhập dưới 32 ký tự.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Mật khẩu không hợp lệ, ít nhất phải có 8 ký tự gồm chữ thường, chữ in hoa, số và ký tự đặc biệt.',
  })
  password: string = defaultPassword;
}
