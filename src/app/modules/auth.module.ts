import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController as AuthControllerBe } from '../controllers/be/v1/auth.controller';
import { AuthController as AuthControllerFe } from '../controllers/fe/v1/auth.controller';
import { UsersModule } from './users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProviderRepository } from '../repositories/auth.repository';

import { RoleModule } from './role.module';
import { ImageModule } from './image.module';
import { MailModule } from './mail.module';
import { UserRoleModule } from './userRole.module';
import { RoleFunctionModule } from './roleFunction.module';
import { CustomerModule } from './customer.module';

@Module({
  imports: [
    CustomerModule,
    UsersModule,
    RoleModule,
    ImageModule,
    MailModule,
    UserRoleModule,
    RoleFunctionModule,
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
