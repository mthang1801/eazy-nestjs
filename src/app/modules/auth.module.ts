import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController as AuthControllerBe } from '../controllers/be/auth.controller';
import { AuthController as AuthControllerFe } from '../controllers/fe/auth.controller';
import { UsersModule } from './users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProviderRepository } from '../repositories/auth.repository';

import { UserGroupsModule } from './usergroups.module';
import { ImageModule } from './image.module';
import { MailModule } from './mail.module';
import { UserGroupLinksModule } from './usergroup_links.module';
import { UserGroupPrivilegeModule } from './usergroup_privilege.module';

@Module({
  imports: [
    UsersModule,
    UserGroupsModule,
    ImageModule,
    MailModule,
    UserGroupLinksModule,
    UserGroupPrivilegeModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecretKey'),
        signOptions: { expiresIn: configService.get<string>('jwtExpiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthProviderRepository],
  exports: [AuthService],
  controllers: [AuthControllerBe, AuthControllerFe],
})
export class AuthModule {}
