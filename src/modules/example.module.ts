import { Module } from '@nestjs/common';
import { ExampleController } from '../controllers/api/example.controller';
import { ExampleService } from '../services/exampple.service';

@Module({
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
