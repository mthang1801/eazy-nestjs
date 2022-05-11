import { Module, forwardRef } from '@nestjs/common';
import { RoleFunctController } from '../controllers/be/v1/roleFunct.controller';
import { RoleFunctionRepository } from '../repositories/roleFunction.repository';
import { RoleFunctService } from '../services/roleFunct.service';
import { FunctRepository } from '../repositories/funct.repository';
import { RoleModule } from './role.module';
import { UserRoleRepository } from '../repositories/userRole.repository';
@Module({
  imports: [forwardRef(() => RoleModule)],
  controllers: [RoleFunctController],
  providers: [
    RoleFunctionRepository,
    FunctRepository,
    RoleFunctService,
    UserRoleRepository,
  ],
  exports: [RoleFunctionRepository, FunctRepository, RoleFunctService],
})
export class RoleFunctionModule {}
