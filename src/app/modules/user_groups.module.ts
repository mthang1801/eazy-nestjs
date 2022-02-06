import { Module } from '@nestjs/common';
import { UserGroupsService } from '../services/user_groups.service';
import {
  UserGroupsRepository,
  UserGroupLinksRepository,
  UserGroupDescriptionsRepository,
  UserGroupPrivilegesRepository,
} from '../repositories/user_groups.repository';
import { UsergroupsController } from '../controllers/be/user_groups.controller';
import { UserRepository } from '../repositories/user.repository';

@Module({
  providers: [
    UserGroupsService,
    UserGroupsRepository,
    UserGroupLinksRepository,
    UserGroupDescriptionsRepository,
    UserGroupPrivilegesRepository,
    UserRepository,
  ],
  exports: [
    UserGroupsService,
    UserGroupLinksRepository,
    UserGroupDescriptionsRepository,
    UserGroupPrivilegesRepository,
    UserGroupsRepository,
  ],
  controllers: [UsergroupsController],
})
export class UserGroupsModule {}
