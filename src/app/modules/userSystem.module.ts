import { Module } from '@nestjs/common';
import { UserSystemController } from '../controllers/be/userSystem.controller';
import { UserSystemService } from '../services/userSystem.service';
import { UsersModule } from './users.module';
import { UserGroupsModule } from './usergroups.module';
import { UserGroupLinksModule } from './usergroupLinks.module';
import { UserGroupPrivilegeModule } from './usergroupPrivilege.module';
import { CustomerModule } from './customer.module';

@Module({
  imports: [
    UsersModule,
    UserGroupsModule,
    UserGroupLinksModule,
    UserGroupPrivilegeModule,
    CustomerModule,
  ],
  providers: [UserSystemService],
  controllers: [UserSystemController],
})
export class UserSystemModule {}
