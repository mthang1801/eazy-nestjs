import { IsOptional } from 'class-validator';
import {
  IsString,
  IsEmail,
  Matches,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class AuthCredentialsDto {
  @IsOptional()
  firstname: string = '';

  @IsNotEmpty()
  lastname: string;

  @IsEmail({}, { message: 'Địa chỉ email không hợp lệ.' })
  email: string;

  @MaxLength(32, { message: 'Mật khẩu quá dài, vui lòng nhập dưới 32 ký tự.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Mật khẩu không hợp lệ, ít nhất phải có 8 ký tự gồm chữ thường, chữ in hoa, số và ký tự đặc biệt.',
  })
  password: string;

  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Số điện thoại không hợp lệ.',
  })
  phone: string;
}
