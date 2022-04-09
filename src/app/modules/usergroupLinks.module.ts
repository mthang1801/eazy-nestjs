import { Module } from '@nestjs/common';
import { UserGroupLinksController } from '../controllers/be/v1/usergroupLinks.controller';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupLinksRepository } from '../repositories/usergroupLinks.repository';
import { UserGroupLinkService } from '../services/usergroupLinks.service';
import { UserGroupDescriptionsRepository } from '../repositories/usergroupDescriptions.repository';
import { UserRepository } from '../repositories/user.repository';
@Module({
  controllers: [UserGroupLinksController],
  providers: [
    UserGroupLinksRepository,
    UserGroupLinkService,
    UserGroupsRepository,
    UserGroupDescriptionsRepository,
    UserRepository,
  ],
  exports: [UserGroupLinksRepository, UserGroupLinkService],
})
export class UserGroupLinksModule {}
