import { Module } from '@nestjs/common';

import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroupDescriptions.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserGroupPrivilegeController } from '../controllers/be/usergroupPrivilege.controller';
import { UserGroupPrivilegesRepository } from '../repositories/usergroupPrivileges.repository';
import { UserGroupsPrivilegeService } from '../services/usergroupPrivilege.service';
import { PrivilegeRepository } from '../repositories/privilege.repository';
@Module({
  controllers: [UserGroupPrivilegeController],
  providers: [
    UserGroupPrivilegesRepository,
    PrivilegeRepository,
    UserGroupsPrivilegeService,
  ],
  exports: [
    UserGroupPrivilegesRepository,
    PrivilegeRepository,
    UserGroupsPrivilegeService,
  ],
})
export class UserGroupPrivilegeModule {}
