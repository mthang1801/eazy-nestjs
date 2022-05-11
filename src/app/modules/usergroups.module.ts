import { Module } from '@nestjs/common';
import { UserGroupsService } from '../services/usergroups.service';

import { UsergroupsController } from '../controllers/be/v1/usergroups.controller';
import { RoleRepository } from '../repositories/role.repository';
import { UserGroupPrivilegeModule } from './usergroupPrivilege.module';
import { UserGroupLinksModule } from './usergroupLinks.module';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserRepository } from '../repositories/user.repository';
import { FunctRepository } from '../repositories/privilege.repository';

@Module({
  imports: [UserGroupPrivilegeModule, UserGroupLinksModule],
  providers: [
    UserGroupsService,
    RoleRepository,
    UserProfileRepository,
    UserRepository,
    FunctRepository,
  ],
  exports: [
    UserGroupsService,
    RoleRepository,
    UserProfileRepository,
    UserRepository,
    FunctRepository,
  ],
  controllers: [UsergroupsController],
})
export class UserGroupsModule {}
