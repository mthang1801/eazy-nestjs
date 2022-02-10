import { Module } from '@nestjs/common';

import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroupDescriptions.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserGroupPrivilegeController } from '../controllers/be/usergroupPrivilege.controller';
import { UserGroupPrivilegesRepository } from '../repositories/usergroupPrivileges.repository';
import { UserGroupsPrivilegeService } from '../services/usergroupPrivilege.service';
@Module({
  controllers: [UserGroupPrivilegeController],
  providers: [UserGroupPrivilegesRepository, UserGroupsPrivilegeService],
  exports: [UserGroupPrivilegesRepository, UserGroupsPrivilegeService],
})
export class UserGroupPrivilegeModule {}
