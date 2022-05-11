import { Module, forwardRef } from '@nestjs/common';

import { RoleRepository } from '../repositories/role.repository';

import { UserRepository } from '../repositories/user.repository';
import { UserGroupPrivilegeController } from '../controllers/be/v1/usergroupPrivilege.controller';
import { UserGroupPrivilegesRepository } from '../repositories/usergroupPrivileges.repository';
import { UserGroupsPrivilegeService } from '../services/usergroupPrivilege.service';
import { FunctRepository } from '../repositories/privilege.repository';
import { UserGroupsModule } from './usergroups.module';
import { UserGroupLinksRepository } from '../repositories/usergroupLinks.repository';
@Module({
  imports: [forwardRef(() => UserGroupsModule)],
  controllers: [UserGroupPrivilegeController],
  providers: [
    UserGroupPrivilegesRepository,
    FunctRepository,
    UserGroupsPrivilegeService,
    UserGroupLinksRepository,
  ],
  exports: [
    UserGroupPrivilegesRepository,
    FunctRepository,
    UserGroupsPrivilegeService,
  ],
})
export class UserGroupPrivilegeModule {}
