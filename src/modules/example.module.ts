import { Module } from '@nestjs/common';
import { ExampleController } from '../controllers/api/example.controller';
import { ExampleService } from '../services/example.service';
import { MailerService } from '@nestjs-modules/mailer';

@Module({
  imports: [],
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
