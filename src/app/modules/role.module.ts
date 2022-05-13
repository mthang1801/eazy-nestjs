import { Global, Module } from '@nestjs/common';
import { RoleService } from '../services/role.service';

import { RoleController } from '../controllers/be/v1/role.controller';
import { RoleRepository } from '../repositories/role.repository';
import { RoleFunctionModule } from './roleFunction.module';
import { UserRoleModule } from './userRole.module';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserRepository } from '../repositories/user.repository';
import { FunctRepository } from '../repositories/funct.repository';

@Global()
@Module({
  imports: [RoleFunctionModule, UserRoleModule],
  providers: [
    RoleService,
    RoleRepository,
    UserProfileRepository,
    UserRepository,
    FunctRepository,
  ],
  exports: [
    RoleService,
    RoleRepository,
    UserProfileRepository,
    UserRepository,
    FunctRepository,
  ],
  controllers: [RoleController],
})
export class RoleModule {}
