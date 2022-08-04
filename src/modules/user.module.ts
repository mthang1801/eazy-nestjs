import { Module } from '@nestjs/common';
import { UserController } from 'src/controllers/api/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { OrderRepository } from '../repositories/order.repository';

@Module({
  providers: [UserService, UserRepository, OrderRepository],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
