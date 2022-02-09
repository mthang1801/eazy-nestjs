import { Module } from '@nestjs/common';

import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroup_descriptions.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserGroupPrivilegeController } from '../controllers/be/usergroup_privilege.controller';
import { UserGroupPrivilegesRepository } from '../repositories/usergroup_privileges.repository';
import { UserGroupsPrivilegeService } from '../services/usergroup_privilege.service';
@Module({
  controllers: [UserGroupPrivilegeController],
  providers: [UserGroupPrivilegesRepository, UserGroupsPrivilegeService],
  exports: [UserGroupPrivilegesRepository, UserGroupsPrivilegeService],
})
export class UserGroupPrivilegeModule {}
