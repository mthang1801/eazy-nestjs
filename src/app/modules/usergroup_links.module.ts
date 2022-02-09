import { Module } from '@nestjs/common';
import { UserGroupLinksController } from '../controllers/be/usergroup_links.controller';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupLinksRepository } from '../repositories/usergroup_links.repository';
import { UserGroupLinkService } from '../services/usergroup_links.service';
import { UserGroupDescriptionsRepository } from '../repositories/usergroup_descriptions.repository';
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
