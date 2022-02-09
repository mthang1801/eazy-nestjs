import { Module } from '@nestjs/common';
import { UserGroupsService } from '../services/usergroups.service';

import { UsergroupsController } from '../controllers/be/usergroups.controller';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroup_descriptions.repository';
import { UserGroupPrivilegeModule } from './usergroup_privilege.module';
import { UserGroupLinksModule } from './usergroup_links.module';

@Module({
  imports: [UserGroupPrivilegeModule, UserGroupLinksModule],
  providers: [
    UserGroupsService,
    UserGroupDescriptionsRepository,
    UserGroupsRepository,
  ],
  exports: [
    UserGroupsService,
    UserGroupDescriptionsRepository,
    UserGroupsRepository,
  ],
  controllers: [UsergroupsController],
})
export class UserGroupsModule {}
