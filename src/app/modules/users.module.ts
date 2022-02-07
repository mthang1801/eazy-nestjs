import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UsersController as UsersControllerBe } from '../controllers/be/users.controller';
import { UsersController as UsersControllerFe } from '../controllers/fe/users.controller';
import { MailModule } from './mail.module';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { UserGroupsModule } from './user_groups.module';
import { UserRepository } from '../repositories/user.repository';
import { UserProfileRepository } from '../repositories/user-profile.repository';
import { UserDataRepository } from '../repositories/user-data.repository';
import { UserMailingListRepository } from '../repositories/user_mailing_lists.repository';
@Module({
  imports: [MailModule, UserGroupsModule],
  exports: [
    UsersService,
    UserRepository,
    UserProfileRepository,
    UserDataRepository,
    UserMailingListRepository,
  ],
  providers: [
    UsersService,
    UserRepository,
    UserProfileRepository,
    UserDataRepository,
    UserMailingListRepository,
  ],
  controllers: [UsersControllerBe, UsersControllerFe],
})
export class UsersModule {}
