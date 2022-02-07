import { Module } from '@nestjs/common';
import { UserGroupsService } from '../services/user_groups.service';

import { UsergroupsController } from '../controllers/be/user_groups.controller';
import { UserRepository } from '../repositories/user.repository';
import { UserGroupsRepository } from '../repositories/user_groups.repository';
import { UserGroupLinksRepository } from '../repositories/usergroup_links.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroup_descriptions.repository';
import { UserGroupPrivilegesRepository } from '../repositories/usergroup_privileges.repository';

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
