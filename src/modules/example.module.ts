import { Module } from '@nestjs/common';
import { ExampleController } from '../controllers/api/example.controller';
import { ExampleService } from '../services/example.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ExampleRepository } from '../repositories/example.repository';

@Module({
  imports: [],
  controllers: [ExampleController],
  providers: [ExampleService, ExampleRepository],
  exports: [ExampleService, ExampleRepository],
})
export class ExampleModule {}
