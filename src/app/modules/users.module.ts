import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UsersController as UsersControllerBe } from '../controllers/be/v1/users.controller';
import { UsersController as UsersControllerFe } from '../controllers/fe/v1/users.controller';
import { MailModule } from './mail.module';
import { RoleModule } from './role.module';
import { UserRepository } from '../repositories/user.repository';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserDataRepository } from '../repositories/userData.repository';
import { UserMailingListRepository } from '../repositories/userMailingLists.repository';
import { UserLoyaltyRepository } from '../repositories/userLoyalty.repository';
import { UserLoyaltyHistoryRepository } from '../repositories/userLoyaltyHistory.repository';

@Module({
  imports: [MailModule, RoleModule],
  exports: [
    UsersService,
    UserRepository,
    UserProfileRepository,
    UserDataRepository,
    UserMailingListRepository,
    UserLoyaltyRepository,
    UserLoyaltyHistoryRepository,
  ],
  providers: [
    UsersService,
    UserRepository,
    UserProfileRepository,
    UserDataRepository,
    UserMailingListRepository,
    UserLoyaltyRepository,
    UserLoyaltyHistoryRepository,
  ],
  controllers: [UsersControllerBe, UsersControllerFe],
})
export class UsersModule {}
