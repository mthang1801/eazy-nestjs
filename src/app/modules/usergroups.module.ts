import { Module } from '@nestjs/common';
import { UserGroupsService } from '../services/usergroups.service';

import { UsergroupsController } from '../controllers/be/usergroups.controller';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroupDescriptions.repository';
import { UserGroupPrivilegeModule } from './usergroupPrivilege.module';
import { UserGroupLinksModule } from './usergroupLinks.module';

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
