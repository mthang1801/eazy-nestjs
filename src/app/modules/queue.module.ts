import { Module } from '@nestjs/common';
import { QueueController } from '../controllers/common/queue.controller';

@Module({
  controllers: [QueueController],
})
export class QueueModule {}
