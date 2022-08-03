import { Module } from '@nestjs/common';
import { UserController } from 'src/controllers/api/user.controller';

@Module({
  controllers: [UserController],
})
export class UserModule {}
