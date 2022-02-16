import { IsNotEmpty, IsOptional } from 'class-validator';

export class AuthLoginProviderDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  familyName: string;

  @IsNotEmpty()
  givenName: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  imageUrl: string;

  @IsNotEmpty()
  accessToken: string;

  @IsOptional()
  extra_data: string;
}
