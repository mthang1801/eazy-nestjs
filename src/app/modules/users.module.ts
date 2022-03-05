import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UsersController as UsersControllerBe } from '../controllers/be/users.controller';
import { UsersController as UsersControllerFe } from '../controllers/fe/users.controller';
import { MailModule } from './mail.module';
import { UserGroupsModule } from './usergroups.module';
import { UserRepository } from '../repositories/user.repository';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserDataRepository } from '../repositories/userData.repository';
import { UserMailingListRepository } from '../repositories/userMailingLists.repository';
import { UserLoyaltyRepository } from '../repositories/userLoyalty.repository';
@Module({
  imports: [MailModule, UserGroupsModule],
  exports: [
    UsersService,
    UserRepository,
    UserProfileRepository,
    UserDataRepository,
    UserMailingListRepository,
    UserLoyaltyRepository,
  ],
  providers: [
    UsersService,
    UserRepository,
    UserProfileRepository,
    UserDataRepository,
    UserMailingListRepository,
    UserLoyaltyRepository,
  ],
  controllers: [UsersControllerBe, UsersControllerFe],
})
export class UsersModule {}
