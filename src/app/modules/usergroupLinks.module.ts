import { Module } from '@nestjs/common';
import { UserGroupLinksController } from '../controllers/be/v1/usergroupLinks.controller';
import { RoleRepository } from '../repositories/role.repository';
import { UserGroupLinksRepository } from '../repositories/usergroupLinks.repository';
import { UserGroupLinkService } from '../services/usergroupLinks.service';
import { UserRepository } from '../repositories/user.repository';
@Module({
  controllers: [UserGroupLinksController],
  providers: [
    UserGroupLinksRepository,
    UserGroupLinkService,
    RoleRepository,
    UserRepository,
  ],
  exports: [UserGroupLinksRepository, UserGroupLinkService],
})
export class UserGroupLinksModule {}
