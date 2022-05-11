import { IsNotEmpty, Matches, MaxLength } from 'class-validator';
export class ChangePasswordDto{
    @IsNotEmpty()
    oldPassword: string;

    @MaxLength(32, { message: 'Mật khẩu quá dài, vui lòng nhập dưới 32 ký tự.' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
        message:
        'Mật khẩu không hợp lệ, ít nhất phải có 8 ký tự gồm chữ thường, chữ in hoa, số và ký tự đặc biệt.',
    })
    @IsNotEmpty()
    newPassword: string;
}