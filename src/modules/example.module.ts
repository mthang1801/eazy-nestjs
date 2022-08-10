import { Module } from '@nestjs/common';
import { ExampleController } from '../controllers/api/example.controller';
import { ExampleService } from '../services/example.service';
import { ExampleRepository } from '../repositories/example.repository';
import { ExampleGateway } from '../websockets/chat.example.gateway';

@Module({
  imports: [],
  controllers: [ExampleController],
  providers: [ExampleService, ExampleGateway, ExampleRepository],
  exports: [ExampleService, ExampleGateway, ExampleRepository],
})
export class ExampleModule {}
