import { AuthProviderEnum } from '../../database/enums/tableFieldEnum/authProvider.enum';

export class AuthProviderEntity {
  user_id: number;
  provider: string;
  provider_name: AuthProviderEnum;
  access_token: string;
  extra_data: string;
  created_at: Date;
}
