import { IsOptional, Matches, MaxLength } from 'class-validator';

export class UpdateUserSystemDto {
  @IsOptional()
  firstname: string;

  @IsOptional()
  lastname: string;

  @IsOptional()
  status: string;

  @IsOptional()
  role_id: number;

  @IsOptional()
  store_id: number;

  @IsOptional()
  @MaxLength(32, { message: 'Mật khẩu quá dài, vui lòng nhập dưới 32 ký tự.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Mật khẩu không hợp lệ, ít nhất phải có 8 ký tự gồm chữ thường, chữ in hoa, số và ký tự đặc biệt.',
  })
  password: string;
}
