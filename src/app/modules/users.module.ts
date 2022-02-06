import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UsersController as UsersControllerBe } from '../controllers/be/users.controller';
import { UsersController as UsersControllerFe } from '../controllers/fe/users.controller';
import { MailModule } from './mail.module';
import { ConfigService, ConfigModule } from '@nestjs/config';
import {
  UserRepository,
  UserProfileRepository,
} from '../repositories/user.repository';
@Module({
  imports: [MailModule],
  exports: [UsersService],
  providers: [UsersService, UserRepository, UserProfileRepository],
  controllers: [UsersControllerBe, UsersControllerFe],
})
export class UsersModule {}
