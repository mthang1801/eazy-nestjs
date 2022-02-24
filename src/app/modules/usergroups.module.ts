import { Module } from '@nestjs/common';
import { UserGroupsService } from '../services/usergroups.service';

import { UsergroupsController } from '../controllers/be/usergroups.controller';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroupDescriptions.repository';
import { UserGroupPrivilegeModule } from './usergroupPrivilege.module';
import { UserGroupLinksModule } from './usergroupLinks.module';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserRepository } from '../repositories/user.repository';

@Module({
  imports: [UserGroupPrivilegeModule, UserGroupLinksModule],
  providers: [
    UserGroupsService,
    UserGroupDescriptionsRepository,
    UserGroupsRepository,
    UserProfileRepository,
    UserRepository,
  ],
  exports: [
    UserGroupsService,
    UserGroupDescriptionsRepository,
    UserGroupsRepository,
    UserProfileRepository,
    UserRepository,
  ],
  controllers: [UsergroupsController],
})
export class UserGroupsModule {}
