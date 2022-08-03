import { Module } from '@nestjs/common';
import { AuthenticationController } from '../controllers/api/auth.controller';

@Module({
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
