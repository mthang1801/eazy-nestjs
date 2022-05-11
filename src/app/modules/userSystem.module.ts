import { Module } from '@nestjs/common';
import { UserSystemController } from '../controllers/be/v1/userSystem.controller';
import { UserSystemService } from '../services/userSystem.service';
import { UsersModule } from './users.module';
import { RoleModule } from './role.module';
import { UserRoleModule } from './userRole.module';
import { RoleFunctionModule } from './roleFunction.module';
import { CustomerModule } from './customer.module';

@Module({
  imports: [
    UsersModule,
    RoleModule,
    UserRoleModule,
    RoleFunctionModule,
    CustomerModule,
  ],
  providers: [UserSystemService],
  controllers: [UserSystemController],
})
export class UserSystemModule {}
