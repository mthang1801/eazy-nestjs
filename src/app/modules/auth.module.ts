import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController as AuthControllerBe } from '../controllers/be/auth.controller';
import { AuthController as AuthControllerFe } from '../controllers/fe/auth.controller';
import { UsersModule } from './users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProviderRepository } from '../repositories/auth.repository';
import { UserProfileRepository } from '../repositories/user.repository';
import { UserGroupsModule } from './user_groups.module';
import { ImageModule } from './image.module';

@Module({
  imports: [
    UsersModule,
    UserGroupsModule,
    ImageModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecretKey'),
        signOptions: { expiresIn: configService.get<string>('jwtExpiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthProviderRepository, UserProfileRepository],
  exports: [AuthService],
  controllers: [AuthControllerBe, AuthControllerFe],
})
export class AuthModule {}
